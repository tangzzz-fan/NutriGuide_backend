import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    UseGuards,
    Request,
    Get,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
    ApiBody,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

import {
    EmailPasswordLoginDto,
    PhonePasswordLoginDto,
    PhoneSmsLoginDto,
    PhoneOneTapLoginDto,
    SocialLoginDto,
    RefreshTokenDto,
    LogoutDto,
} from './dto/login.dto';

import { SendSmsCodeDto, VerifySmsCodeDto, SmsCodeResponseDto } from './dto/sms.dto';
import {
    LoginResponseDto,
    RefreshTokenResponseDto,
    LogoutResponseDto,
    RegisterResponseDto,
} from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { ResponseDto, ErrorResponseDto } from '../../common/dto/response.dto';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login/email')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Email/Username + Password Login',
        description: 'Login with email or username and password',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/LoginResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: EmailPasswordLoginDto })
    async loginWithEmail(@Body() loginDto: EmailPasswordLoginDto): Promise<ResponseDto<LoginResponseDto>> {
        const result = await this.authService.loginWithEmailPassword(loginDto);

        return new ResponseDto(
            HttpStatus.OK,
            'Login successful',
            result
        );
    }

    @Post('login/phone')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Phone + Password Login',
        description: 'Login with phone number and password',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/LoginResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: PhonePasswordLoginDto })
    async loginWithPhone(@Body() loginDto: PhonePasswordLoginDto): Promise<ResponseDto<LoginResponseDto>> {
        const result = await this.authService.loginWithPhonePassword(loginDto);

        return new ResponseDto(
            HttpStatus.OK,
            'Login successful',
            result
        );
    }

    @Post('login/sms')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Phone + SMS Code Login',
        description: 'Login with phone number and SMS verification code',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/LoginResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired SMS code',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: PhoneSmsLoginDto })
    async loginWithSms(@Body() loginDto: PhoneSmsLoginDto): Promise<ResponseDto<LoginResponseDto>> {
        const result = await this.authService.loginWithPhoneSms(loginDto);

        return new ResponseDto(
            HttpStatus.OK,
            'Login successful',
            result
        );
    }

    @Post('login/one-tap')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Phone One-Tap Login',
        description: 'Login with phone number using mobile SDK one-tap verification',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/LoginResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid one-tap token',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: PhoneOneTapLoginDto })
    async loginWithOneTap(@Body() loginDto: PhoneOneTapLoginDto): Promise<ResponseDto<LoginResponseDto>> {
        const result = await this.authService.loginWithPhoneOneTap(loginDto);

        return new ResponseDto(
            HttpStatus.OK,
            'Login successful',
            result
        );
    }

    @Post('login/social')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Social Login',
        description: 'Login with social providers (WeChat, Apple, Google, Facebook)',
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/LoginResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid social login token',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: SocialLoginDto })
    async loginWithSocial(@Body() loginDto: SocialLoginDto): Promise<ResponseDto<LoginResponseDto>> {
        const result = await this.authService.loginWithSocial(loginDto);

        return new ResponseDto(
            HttpStatus.OK,
            'Login successful',
            result
        );
    }

    @Post('sms/send')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Send SMS Verification Code',
        description: 'Send SMS verification code to phone number',
    })
    @ApiResponse({
        status: 200,
        description: 'SMS code sent successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/SmsCodeResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 400,
        description: 'SMS code already sent or rate limited',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: SendSmsCodeDto })
    async sendSmsCode(@Body() sendSmsDto: SendSmsCodeDto): Promise<ResponseDto<SmsCodeResponseDto>> {
        const result = await this.authService.sendSmsCode(sendSmsDto);
        const responseData = {
            ...result,
            retryAfterSeconds: 60, // Rate limiting
        };

        return new ResponseDto(
            HttpStatus.OK,
            'SMS code sent successfully',
            responseData
        );
    }

    @Post('sms/verify')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Verify SMS Code',
        description: 'Verify SMS verification code',
    })
    @ApiResponse({
        status: 200,
        description: 'SMS code verified successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                success: { type: 'boolean', example: true },
                                verified: { type: 'boolean', example: true },
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired SMS code',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: VerifySmsCodeDto })
    async verifySmsCode(@Body() verifyDto: VerifySmsCodeDto): Promise<ResponseDto<{ success: boolean; verified: boolean }>> {
        const isValid = await this.authService.verifySmsCode(verifyDto);

        if (!isValid) {
            return new ResponseDto(
                HttpStatus.BAD_REQUEST,
                'Invalid or expired SMS code',
                { success: false, verified: false }
            );
        }

        return new ResponseDto(
            HttpStatus.OK,
            'SMS code verified successfully',
            { success: true, verified: true }
        );
    }

    @Post('refresh')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Refresh Access Token',
        description: 'Refresh access token using refresh token',
    })
    @ApiResponse({
        status: 200,
        description: 'Token refreshed successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/RefreshTokenResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired refresh token',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: RefreshTokenDto })
    async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<ResponseDto<RefreshTokenResponseDto>> {
        const result = await this.authService.refreshToken(refreshDto);

        return new ResponseDto(
            HttpStatus.OK,
            'Token refreshed successfully',
            result
        );
    }

    @Post('logout')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({
        summary: 'Logout',
        description: 'Logout user and invalidate tokens',
    })
    @ApiResponse({
        status: 200,
        description: 'Logout successful',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/LogoutResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: LogoutDto })
    async logout(@Body() logoutDto: LogoutDto, @Request() req): Promise<ResponseDto<LogoutResponseDto>> {
        const userId = req.user.sub;
        const result = await this.authService.logout(logoutDto, userId);

        return new ResponseDto(
            HttpStatus.OK,
            'Logout successful',
            result
        );
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Get Current User Profile',
        description: 'Get authenticated user profile information',
    })
    @ApiResponse({
        status: 200,
        description: 'User profile retrieved successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', example: '507f1f77bcf86cd799439011' },
                                username: { type: 'string', example: 'johndoe' },
                                email: { type: 'string', example: 'john@example.com' },
                                firstName: { type: 'string', example: 'John' },
                                lastName: { type: 'string', example: 'Doe' },
                                phone: { type: 'string', example: '+1234567890' },
                                isEmailVerified: { type: 'boolean', example: true },
                                isActive: { type: 'boolean', example: true },
                                createdAt: { type: 'string', format: 'date-time' },
                                lastLoginAt: { type: 'string', format: 'date-time' },
                            }
                        }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
        type: ErrorResponseDto,
    })
    async getProfile(@Request() req): Promise<ResponseDto<any>> {
        const userId = req.user.sub;
        // This would typically use a separate UserService method
        // For now, return basic user info from the JWT payload
        const profileData = {
            id: userId,
            username: req.user.username,
            email: req.user.email,
            phone: req.user.phone,
        };

        return new ResponseDto(
            HttpStatus.OK,
            'User profile retrieved successfully',
            profileData
        );
    }

    @Post('register')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({
        summary: 'User Registration',
        description: 'Register a new user account and automatically log them in',
    })
    @ApiResponse({
        status: 201,
        description: 'User registered and logged in successfully',
        schema: {
            allOf: [
                { $ref: '#/components/schemas/ResponseDto' },
                {
                    properties: {
                        data: { $ref: '#/components/schemas/RegisterResponseDto' }
                    }
                }
            ]
        }
    })
    @ApiResponse({
        status: 409,
        description: 'Email, username, or phone already exists',
        type: ErrorResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data',
        type: ErrorResponseDto,
    })
    @ApiBody({ type: RegisterDto })
    async register(@Body() registerDto: RegisterDto): Promise<ResponseDto<RegisterResponseDto>> {
        const result = await this.authService.register(registerDto);

        return new ResponseDto(
            HttpStatus.CREATED,
            'User registered and logged in successfully',
            result
        );
    }
} 