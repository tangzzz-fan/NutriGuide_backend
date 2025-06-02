import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AuthTokenModel } from './schemas/auth-token.schema';
import { SmsVerificationModel } from './schemas/sms-verification.schema';
import { SocialLoginModel } from './schemas/social-login.schema';

// Mock bcrypt at the module level
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn(),
}));

describe('AuthService', () => {
    let service: AuthService;
    let userService: UserService;
    let jwtService: JwtService;
    let authTokenModel: any;
    let smsVerificationModel: any;
    let socialLoginModel: any;

    const mockUser = {
        _id: '507f1f77bcf86cd799439011',
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        phone: '+1234567890',
        password: '$2b$12$hashedPassword',
        isActive: true,
        isEmailVerified: true,
        createdAt: new Date(),
        lastLoginAt: new Date(),
    };

    const mockUserService = {
        findByEmailOrUsername: jest.fn(),
        findByPhone: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        create: jest.fn(),
        updateLastLogin: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn(),
    };

    const mockAuthTokenModel = {
        findOne: jest.fn(),
        updateOne: jest.fn(),
        updateMany: jest.fn(),
        create: jest.fn(),
    };

    const mockSmsVerificationModel = {
        findOne: jest.fn(),
        updateOne: jest.fn(),
        create: jest.fn(),
    };

    const mockSocialLoginModel = {
        findOne: jest.fn(),
        updateOne: jest.fn(),
        create: jest.fn(),
        populate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
                {
                    provide: getModelToken('AuthTokenModel'),
                    useValue: mockAuthTokenModel,
                },
                {
                    provide: getModelToken('SmsVerificationModel'),
                    useValue: mockSmsVerificationModel,
                },
                {
                    provide: getModelToken('SocialLoginModel'),
                    useValue: mockSocialLoginModel,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get<UserService>(UserService);
        jwtService = module.get<JwtService>(JwtService);
        authTokenModel = module.get(getModelToken('AuthTokenModel'));
        smsVerificationModel = module.get(getModelToken('SmsVerificationModel'));
        socialLoginModel = module.get(getModelToken('SocialLoginModel'));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('loginWithEmailPassword', () => {
        const loginDto = {
            identifier: 'test@example.com',
            password: 'password123',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully with valid credentials', async () => {
            mockUserService.findByEmailOrUsername.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockAuthTokenModel.create.mockResolvedValue({ token: 'mock-refresh-token' });

            const result = await service.loginWithEmailPassword(loginDto);

            expect(result).toEqual({
                user: expect.objectContaining({
                    id: mockUser._id,
                    username: mockUser.username,
                    email: mockUser.email,
                }),
                accessToken: 'mock-jwt-token',
                refreshToken: expect.any(String),
                tokenType: 'Bearer',
                expiresIn: 3600,
            });
            expect(mockUserService.updateLastLogin).toHaveBeenCalledWith(mockUser._id);
        });

        it('should throw UnauthorizedException for invalid user', async () => {
            mockUserService.findByEmailOrUsername.mockResolvedValue(null);

            await expect(service.loginWithEmailPassword(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should throw UnauthorizedException for invalid password', async () => {
            mockUserService.findByEmailOrUsername.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.loginWithEmailPassword(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });

        it('should throw UnauthorizedException for inactive user', async () => {
            const inactiveUser = { ...mockUser, isActive: false };
            mockUserService.findByEmailOrUsername.mockResolvedValue(inactiveUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            await expect(service.loginWithEmailPassword(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('loginWithPhonePassword', () => {
        const loginDto = {
            phone: '+1234567890',
            password: 'password123',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully with valid phone and password', async () => {
            mockUserService.findByPhone.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockAuthTokenModel.create.mockResolvedValue({ token: 'mock-refresh-token' });

            const result = await service.loginWithPhonePassword(loginDto);

            expect(result).toEqual({
                user: expect.objectContaining({
                    id: mockUser._id,
                    phone: mockUser.phone,
                }),
                accessToken: 'mock-jwt-token',
                refreshToken: expect.any(String),
                tokenType: 'Bearer',
                expiresIn: 3600,
            });
        });

        it('should throw UnauthorizedException for invalid phone', async () => {
            mockUserService.findByPhone.mockResolvedValue(null);

            await expect(service.loginWithPhonePassword(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('loginWithPhoneSms', () => {
        const loginDto = {
            phone: '+1234567890',
            smsCode: '123456',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully with valid SMS code', async () => {
            // Mock SMS verification
            mockSmsVerificationModel.findOne.mockResolvedValue({
                _id: 'sms-id',
                phone: loginDto.phone,
                code: loginDto.smsCode,
                verified: false,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            });
            mockSmsVerificationModel.updateOne.mockResolvedValue({});

            mockUserService.findByPhone.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockAuthTokenModel.create.mockResolvedValue({ token: 'mock-refresh-token' });

            const result = await service.loginWithPhoneSms(loginDto);

            expect(result).toEqual({
                user: expect.objectContaining({
                    id: mockUser._id,
                }),
                accessToken: 'mock-jwt-token',
                refreshToken: expect.any(String),
                tokenType: 'Bearer',
                expiresIn: 3600,
            });
        });

        it('should auto-register user if not found', async () => {
            const newUser = { ...mockUser, _id: 'new-user-id' };

            // Mock SMS verification
            mockSmsVerificationModel.findOne.mockResolvedValue({
                _id: 'sms-id',
                phone: loginDto.phone,
                code: loginDto.smsCode,
                verified: false,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            });
            mockSmsVerificationModel.updateOne.mockResolvedValue({});

            mockUserService.findByPhone.mockResolvedValue(null);
            mockUserService.create.mockResolvedValue(newUser);
            mockJwtService.sign.mockReturnValue('mock-jwt-token');
            mockAuthTokenModel.create.mockResolvedValue({ token: 'mock-refresh-token' });

            const result = await service.loginWithPhoneSms(loginDto);

            expect(mockUserService.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    phone: loginDto.phone,
                })
            );
            expect(result.user.id).toBe(newUser._id);
        });

        it('should throw UnauthorizedException for invalid SMS code', async () => {
            mockSmsVerificationModel.findOne.mockResolvedValue(null);

            await expect(service.loginWithPhoneSms(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('sendSmsCode', () => {
        const sendSmsDto = {
            phone: '+1234567890',
            type: 'login' as const,
            deviceId: 'device-123',
        };

        it('should send SMS code successfully', async () => {
            mockSmsVerificationModel.findOne.mockResolvedValue(null); // No recent SMS
            mockSmsVerificationModel.create.mockResolvedValue({});

            const result = await service.sendSmsCode(sendSmsDto);

            expect(result).toEqual({
                success: true,
                message: 'SMS code sent successfully',
                expiryMinutes: 5,
            });
            expect(mockSmsVerificationModel.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    phone: sendSmsDto.phone,
                    type: sendSmsDto.type,
                    code: expect.any(String),
                    expiresAt: expect.any(Date),
                })
            );
        });

        it('should throw BadRequestException for rate limiting', async () => {
            mockSmsVerificationModel.findOne.mockResolvedValue({
                phone: sendSmsDto.phone,
                createdAt: new Date(),
            });

            await expect(service.sendSmsCode(sendSmsDto)).rejects.toThrow(
                BadRequestException
            );
        });
    });

    describe('verifySmsCode', () => {
        const verifyDto = {
            phone: '+1234567890',
            code: '123456',
            type: 'login' as const,
        };

        it('should verify SMS code successfully', async () => {
            mockSmsVerificationModel.findOne.mockResolvedValue({
                _id: 'sms-id',
                phone: verifyDto.phone,
                code: verifyDto.code,
                verified: false,
                expiresAt: new Date(Date.now() + 5 * 60 * 1000),
            });
            mockSmsVerificationModel.updateOne.mockResolvedValue({});

            const result = await service.verifySmsCode(verifyDto);

            expect(result).toBe(true);
            expect(mockSmsVerificationModel.updateOne).toHaveBeenCalledWith(
                { _id: 'sms-id' },
                expect.objectContaining({
                    verified: true,
                    verifiedAt: expect.any(Date),
                })
            );
        });

        it('should return false for invalid code', async () => {
            mockSmsVerificationModel.findOne.mockResolvedValue(null);

            const result = await service.verifySmsCode(verifyDto);

            expect(result).toBe(false);
        });
    });

    describe('refreshToken', () => {
        const refreshDto = {
            refreshToken: 'valid-refresh-token',
        };

        it('should refresh token successfully', async () => {
            const tokenRecord = {
                _id: 'token-id',
                userId: mockUser._id,
                token: refreshDto.refreshToken,
                deviceId: 'device-123',
            };

            mockAuthTokenModel.findOne.mockResolvedValue(tokenRecord);
            mockUserService.findById.mockResolvedValue(mockUser);
            mockJwtService.sign.mockReturnValue('new-jwt-token');
            mockAuthTokenModel.create.mockResolvedValue({ token: 'new-refresh-token' });
            mockAuthTokenModel.updateOne.mockResolvedValue({});

            const result = await service.refreshToken(refreshDto);

            expect(result).toEqual({
                accessToken: 'new-jwt-token',
                refreshToken: expect.any(String),
                tokenType: 'Bearer',
                expiresIn: 3600,
                refreshExpiresIn: 30 * 24 * 60 * 60,
            });
        });

        it('should throw UnauthorizedException for invalid refresh token', async () => {
            mockAuthTokenModel.findOne.mockResolvedValue(null);

            await expect(service.refreshToken(refreshDto)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('logout', () => {
        const logoutDto = {
            refreshToken: 'valid-refresh-token',
            deviceId: 'device-123',
            logoutFromAllDevices: false,
        };
        const userId = 'user-id';

        it('should logout successfully', async () => {
            mockAuthTokenModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

            const result = await service.logout(logoutDto, userId);

            expect(result).toEqual({
                success: true,
                message: 'Logged out successfully',
                sessionsTerminated: 1,
            });
        });

        it('should logout from all devices', async () => {
            const logoutAllDto = { ...logoutDto, logoutFromAllDevices: true };
            mockAuthTokenModel.updateMany.mockResolvedValue({ modifiedCount: 3 });

            const result = await service.logout(logoutAllDto, userId);

            expect(result.sessionsTerminated).toBe(3);
            expect(mockAuthTokenModel.updateMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    userId,
                    type: 'refresh',
                    isRevoked: false,
                }),
                { isRevoked: true }
            );
        });
    });
}); 