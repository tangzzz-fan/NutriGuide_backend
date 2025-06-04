import { Injectable, UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schemas/user.schema';
import { AuthTokenDocument } from './schemas/auth-token.schema';
import { SmsVerificationDocument } from './schemas/sms-verification.schema';
import { SocialLoginDocument } from './schemas/social-login.schema';

import {
    EmailPasswordLoginDto,
    PhonePasswordLoginDto,
    PhoneSmsLoginDto,
    PhoneOneTapLoginDto,
    SocialLoginDto,
    RefreshTokenDto,
    LogoutDto,
} from './dto/login.dto';

import { SendSmsCodeDto, VerifySmsCodeDto } from './dto/sms.dto';
import { LoginResponseDto, RefreshTokenResponseDto, LogoutResponseDto, RegisterResponseDto } from './dto/auth-response.dto';

import {
    JwtPayload,
    AuthResult,
    LoginResponse,
    SocialLoginResult,
    LoginMethod,
} from './interfaces/auth.interface';

import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        @InjectModel('AuthTokenModel') private readonly authTokenModel: Model<AuthTokenDocument>,
        @InjectModel('SmsVerificationModel') private readonly smsVerificationModel: Model<SmsVerificationDocument>,
        @InjectModel('SocialLoginModel') private readonly socialLoginModel: Model<SocialLoginDocument>,
    ) { }

    /**
     * Email/Username + Password login
     */
    async loginWithEmailPassword(loginDto: EmailPasswordLoginDto): Promise<LoginResponseDto> {
        const { identifier, password } = loginDto;

        // Find user by email or username
        const user = await this.userService.findByEmailOrUsername(identifier);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Update last login
        await this.userService.updateLastLogin(user._id.toString());

        // Generate tokens
        return this.generateAuthResponse(user, loginDto.deviceId, loginDto.rememberMe);
    }

    /**
     * Phone + Password login
     */
    async loginWithPhonePassword(loginDto: PhonePasswordLoginDto): Promise<LoginResponseDto> {
        const { phone, password } = loginDto;

        // Find user by phone
        const user = await this.userService.findByPhone(phone);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Update last login
        await this.userService.updateLastLogin(user._id.toString());

        // Generate tokens
        return this.generateAuthResponse(user, loginDto.deviceId, loginDto.rememberMe);
    }

    /**
     * Phone + SMS Code login
     */
    async loginWithPhoneSms(loginDto: PhoneSmsLoginDto): Promise<LoginResponseDto> {
        const { phone, smsCode } = loginDto;

        // Verify SMS code
        const isCodeValid = await this.verifySmsCode({ phone, code: smsCode, type: 'login' });
        if (!isCodeValid) {
            throw new UnauthorizedException('Invalid or expired SMS code');
        }

        // Find or create user
        let user = await this.userService.findByPhone(phone);
        if (!user) {
            // Auto-register user with phone number
            user = await this.userService.create({
                username: `user_${phone.replace(/\D/g, '').slice(-8)}`,
                phone,
                email: `${phone.replace(/\D/g, '')}@temp.nutriguide.com`,
                firstName: 'User',
                lastName: '',
                password: await bcrypt.hash(uuidv4(), 12), // Random password
            });
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Update last login
        await this.userService.updateLastLogin(user._id.toString());

        // Generate tokens
        return this.generateAuthResponse(user, loginDto.deviceId, loginDto.rememberMe);
    }

    /**
     * Phone One-Tap login (mobile SDK)
     */
    async loginWithPhoneOneTap(loginDto: PhoneOneTapLoginDto): Promise<LoginResponseDto> {
        const { phone, oneTapToken } = loginDto;

        // Verify one-tap token (this would integrate with mobile SDK)
        const isTokenValid = await this.verifyOneTapToken(oneTapToken, phone);
        if (!isTokenValid) {
            throw new UnauthorizedException('Invalid one-tap token');
        }

        // Find or create user
        let user = await this.userService.findByPhone(phone);
        if (!user) {
            // Auto-register user with phone number
            user = await this.userService.create({
                username: `user_${phone.replace(/\D/g, '').slice(-8)}`,
                phone,
                email: `${phone.replace(/\D/g, '')}@temp.nutriguide.com`,
                firstName: 'User',
                lastName: '',
                password: await bcrypt.hash(uuidv4(), 12), // Random password
            });
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Update last login
        await this.userService.updateLastLogin(user._id.toString());

        // Generate tokens
        return this.generateAuthResponse(user, loginDto.deviceId, loginDto.rememberMe);
    }

    /**
     * Social login (WeChat, Apple, Google, Facebook)
     */
    async loginWithSocial(loginDto: SocialLoginDto): Promise<LoginResponseDto> {
        const { provider, accessToken, idToken } = loginDto;

        // Verify social token and get user info
        const socialUserInfo = await this.verifySocialToken(provider, accessToken, idToken);
        if (!socialUserInfo) {
            throw new UnauthorizedException('Invalid social login token');
        }

        // Find existing social login
        let socialLogin = await this.socialLoginModel.findOne({
            provider,
            providerId: socialUserInfo.providerId,
        }).populate('userId');

        let user: UserDocument;

        if (socialLogin) {
            // Existing social login
            user = socialLogin.userId as any;

            // Update social login info
            await this.socialLoginModel.updateOne(
                { _id: socialLogin._id },
                {
                    lastLoginAt: new Date(),
                    accessToken,
                    providerEmail: socialUserInfo.email,
                    providerName: socialUserInfo.name,
                    providerAvatar: socialUserInfo.avatar,
                }
            );
        } else {
            // New social login - find user by email or create new
            if (socialUserInfo.email) {
                user = await this.userService.findByEmail(socialUserInfo.email);
            }

            if (!user) {
                // Create new user
                user = await this.userService.create({
                    username: `${provider}_${socialUserInfo.providerId.slice(-8)}`,
                    email: socialUserInfo.email || `${provider}_${socialUserInfo.providerId}@temp.nutriguide.com`,
                    firstName: socialUserInfo.name?.split(' ')[0] || 'User',
                    lastName: socialUserInfo.name?.split(' ').slice(1).join(' ') || '',
                    password: await bcrypt.hash(uuidv4(), 12), // Random password
                    isEmailVerified: !!socialUserInfo.email,
                });
            }

            // Create social login record
            await this.socialLoginModel.create({
                userId: user._id,
                provider,
                providerId: socialUserInfo.providerId,
                providerEmail: socialUserInfo.email,
                providerName: socialUserInfo.name,
                providerAvatar: socialUserInfo.avatar,
                accessToken,
                lastLoginAt: new Date(),
            });
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthorizedException('Account is deactivated');
        }

        // Update last login
        await this.userService.updateLastLogin(user._id.toString());

        // Generate tokens
        return this.generateAuthResponse(user, loginDto.deviceId, loginDto.rememberMe);
    }

    /**
     * Send SMS verification code
     */
    async sendSmsCode(sendSmsDto: SendSmsCodeDto): Promise<{ success: boolean; message: string; expiryMinutes: number }> {
        const { phone, type } = sendSmsDto;

        // Check rate limiting - one SMS per minute
        const recentSms = await this.smsVerificationModel.findOne({
            phone,
            type,
            createdAt: { $gte: new Date(Date.now() - 60000) }, // Last 1 minute
        });

        if (recentSms) {
            throw new BadRequestException('SMS code already sent. Please wait before requesting a new one.');
        }

        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Save verification code
        await this.smsVerificationModel.create({
            phone,
            code,
            type,
            expiresAt,
        });

        // Send SMS (integrate with SMS service provider)
        await this.sendSmsMessage(phone, `Your NutriGuide verification code is: ${code}. Valid for 5 minutes.`);

        return {
            success: true,
            message: 'SMS code sent successfully',
            expiryMinutes: 5,
        };
    }

    /**
     * Verify SMS code
     */
    async verifySmsCode(verifyDto: VerifySmsCodeDto): Promise<boolean> {
        const { phone, code, type } = verifyDto;

        const smsVerification = await this.smsVerificationModel.findOne({
            phone,
            code,
            type,
            verified: false,
            expiresAt: { $gt: new Date() },
        });

        if (!smsVerification) {
            return false;
        }

        // Update verification record
        await this.smsVerificationModel.updateOne(
            { _id: smsVerification._id },
            {
                verified: true,
                verifiedAt: new Date(),
            }
        );

        return true;
    }

    /**
     * Refresh access token
     */
    async refreshToken(refreshDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        const { refreshToken } = refreshDto;

        // Find and validate refresh token
        const tokenRecord = await this.authTokenModel.findOne({
            token: refreshToken,
            type: 'refresh',
            isRevoked: false,
            expiresAt: { $gt: new Date() },
        });

        if (!tokenRecord) {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        // Get user
        const user = await this.userService.findById(tokenRecord.userId.toString());
        if (!user || !user.isActive) {
            throw new UnauthorizedException('User not found or inactive');
        }

        // Generate new tokens
        const accessToken = await this.generateAccessToken(user);
        const newRefreshToken = await this.generateRefreshToken(user, tokenRecord.deviceId);

        // Revoke old refresh token
        await this.authTokenModel.updateOne(
            { _id: tokenRecord._id },
            { isRevoked: true }
        );

        return {
            accessToken,
            refreshToken: newRefreshToken,
            tokenType: 'Bearer',
            expiresIn: 3600,
            refreshExpiresIn: 30 * 24 * 60 * 60, // 30 days
        };
    }

    /**
     * Logout user
     */
    async logout(logoutDto: LogoutDto, userId: string): Promise<LogoutResponseDto> {
        const { refreshToken, deviceId, logoutFromAllDevices } = logoutDto;

        let sessionsTerminated = 0;

        if (logoutFromAllDevices) {
            // Revoke all refresh tokens for user
            const result = await this.authTokenModel.updateMany(
                {
                    userId,
                    type: 'refresh',
                    isRevoked: false,
                },
                { isRevoked: true }
            );
            sessionsTerminated = result.modifiedCount;
        } else if (refreshToken) {
            // Revoke specific refresh token
            const result = await this.authTokenModel.updateOne(
                {
                    token: refreshToken,
                    userId,
                    type: 'refresh',
                    isRevoked: false,
                },
                { isRevoked: true }
            );
            sessionsTerminated = result.modifiedCount;
        } else if (deviceId) {
            // Revoke tokens for specific device
            const result = await this.authTokenModel.updateMany(
                {
                    userId,
                    deviceId,
                    type: 'refresh',
                    isRevoked: false,
                },
                { isRevoked: true }
            );
            sessionsTerminated = result.modifiedCount;
        }

        return {
            success: true,
            message: 'Logged out successfully',
            sessionsTerminated,
        };
    }

    /**
     * Generate authentication response with tokens
     */
    private async generateAuthResponse(
        user: UserDocument,
        deviceId?: string,
        rememberMe?: boolean
    ): Promise<LoginResponseDto> {
        const accessToken = await this.generateAccessToken(user);
        const refreshToken = await this.generateRefreshToken(user, deviceId, rememberMe);

        return {
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                fullName: `${user.firstName} ${user.lastName}`.trim(),
                phone: user.phone,
                isEmailVerified: user.isEmailVerified,
                isActive: user.isActive,
                lastLoginAt: user.lastLoginAt,
                createdAt: user.createdAt,
            },
            accessToken,
            refreshToken,
            tokenType: 'Bearer',
            expiresIn: 3600, // 1 hour
        };
    }

    /**
     * Generate JWT access token
     */
    private async generateAccessToken(user: UserDocument): Promise<string> {
        const payload: JwtPayload = {
            sub: user._id.toString(),
            email: user.email,
            username: user.username,
            phone: user.phone,
        };

        return this.jwtService.sign(payload);
    }

    /**
     * Generate refresh token
     */
    private async generateRefreshToken(
        user: UserDocument,
        deviceId?: string,
        rememberMe?: boolean
    ): Promise<string> {
        const token = uuidv4();
        const expiryDays = rememberMe ? 60 : 30; // 60 days if remember me, 30 days otherwise

        await this.authTokenModel.create({
            userId: user._id,
            token,
            type: 'refresh',
            expiresAt: new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000),
            deviceId,
        });

        return token;
    }

    /**
     * Verify one-tap token (integrate with mobile SDK)
     */
    private async verifyOneTapToken(token: string, phone: string): Promise<boolean> {
        // TODO: Integrate with actual mobile SDK verification
        // For now, return true for testing
        return token.startsWith('onetap-') && phone.length > 10;
    }

    /**
     * Verify social login token and get user info
     */
    private async verifySocialToken(
        provider: string,
        accessToken: string,
        idToken?: string
    ): Promise<SocialLoginResult | null> {
        // TODO: Integrate with actual social provider APIs
        // For now, return mock data for testing

        if (!accessToken.startsWith('social-')) {
            return null;
        }

        const mockProviderId = `${provider}_${Date.now()}`;

        return {
            provider: provider as any,
            providerId: mockProviderId,
            email: `test@${provider}.com`,
            name: `Test User`,
            avatar: `https://${provider}.com/avatar.jpg`,
            accessToken,
        };
    }

    /**
     * Send SMS message (integrate with SMS service provider)
     */
    private async sendSmsMessage(phone: string, message: string): Promise<void> {
        // TODO: Integrate with actual SMS service provider (Aliyun, Tencent Cloud, etc.)
        console.log(`SMS to ${phone}: ${message}`);
    }

    /**
     * User registration with auto-login
     */
    async register(registerDto: RegisterDto): Promise<RegisterResponseDto> {
        // Check if email already exists
        const existingUserByEmail = await this.userService.findByEmail(registerDto.email);
        if (existingUserByEmail) {
            throw new ConflictException('Email already exists');
        }

        // Check if username already exists
        const existingUserByUsername = await this.userService.findByUsername(registerDto.username);
        if (existingUserByUsername) {
            throw new ConflictException('Username already exists');
        }

        // Check if phone already exists (if provided)
        if (registerDto.phone) {
            const existingUserByPhone = await this.userService.findByPhone(registerDto.phone);
            if (existingUserByPhone) {
                throw new ConflictException('Phone number already exists');
            }
        }

        // Create new user
        const newUser = await this.userService.create({
            email: registerDto.email,
            username: registerDto.username,
            password: registerDto.password,
            firstName: registerDto.firstName,
            lastName: registerDto.lastName,
            phone: registerDto.phone,
            birthDate: registerDto.birthDate,
            gender: registerDto.gender,
            height: registerDto.height,
            weight: registerDto.weight,
            activityLevel: registerDto.activityLevel,
            isEmailVerified: false, // Default to false, will be verified via email
        });

        // Update last login
        await this.userService.updateLastLogin(newUser._id.toString());

        // Generate auth tokens (auto-login)
        const authResponse = await this.generateAuthResponse(
            newUser,
            registerDto.deviceId,
            registerDto.rememberMe
        );

        // Prepare registration response
        const registerResponse: RegisterResponseDto = {
            user: authResponse.user,
            accessToken: authResponse.accessToken,
            refreshToken: authResponse.refreshToken,
            tokenType: authResponse.tokenType,
            expiresIn: authResponse.expiresIn,
            refreshExpiresIn: authResponse.refreshExpiresIn,
            message: 'User registered and logged in successfully',
            requiresEmailVerification: !newUser.isEmailVerified,
            requiresPhoneVerification: registerDto.phone ? false : undefined, // TODO: Implement phone verification
        };

        return registerResponse;
    }
} 