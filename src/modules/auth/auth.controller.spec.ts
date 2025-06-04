import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException, HttpStatus } from '@nestjs/common';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ResponseDto } from '../../common/dto/response.dto';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        loginWithEmailPassword: jest.fn(),
        loginWithPhonePassword: jest.fn(),
        loginWithPhoneSms: jest.fn(),
        loginWithPhoneOneTap: jest.fn(),
        loginWithSocial: jest.fn(),
        sendSmsCode: jest.fn(),
        verifySmsCode: jest.fn(),
        refreshToken: jest.fn(),
        logout: jest.fn(),
        register: jest.fn(),
    };

    const mockLoginResponse = {
        user: {
            id: '507f1f77bcf86cd799439011',
            username: 'testuser',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User',
            fullName: 'Test User',
            phone: '+1234567890',
            isEmailVerified: true,
            isActive: true,
            lastLoginAt: new Date(),
            createdAt: new Date(),
        },
        accessToken: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token',
        tokenType: 'Bearer' as const,
        expiresIn: 3600,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({ canActivate: () => true })
            .compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('loginWithEmail', () => {
        const loginDto = {
            identifier: 'test@example.com',
            password: 'password123',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully', async () => {
            mockAuthService.loginWithEmailPassword.mockResolvedValue(mockLoginResponse);

            const result = await controller.loginWithEmail(loginDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Login successful');
            expect(result.data).toEqual(mockLoginResponse);
            expect(mockAuthService.loginWithEmailPassword).toHaveBeenCalledWith(loginDto);
        });

        it('should handle invalid credentials', async () => {
            mockAuthService.loginWithEmailPassword.mockRejectedValue(
                new UnauthorizedException('Invalid credentials')
            );

            await expect(controller.loginWithEmail(loginDto)).rejects.toThrow(
                UnauthorizedException
            );
        });
    });

    describe('loginWithPhone', () => {
        const loginDto = {
            phone: '+1234567890',
            password: 'password123',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully', async () => {
            mockAuthService.loginWithPhonePassword.mockResolvedValue(mockLoginResponse);

            const result = await controller.loginWithPhone(loginDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Login successful');
            expect(result.data).toEqual(mockLoginResponse);
            expect(mockAuthService.loginWithPhonePassword).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('loginWithSms', () => {
        const loginDto = {
            phone: '+1234567890',
            smsCode: '123456',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully', async () => {
            mockAuthService.loginWithPhoneSms.mockResolvedValue(mockLoginResponse);

            const result = await controller.loginWithSms(loginDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Login successful');
            expect(result.data).toEqual(mockLoginResponse);
        });
    });

    describe('loginWithOneTap', () => {
        const loginDto = {
            phone: '+1234567890',
            oneTapToken: 'one-tap-token-123',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully', async () => {
            mockAuthService.loginWithPhoneOneTap.mockResolvedValue(mockLoginResponse);

            const result = await controller.loginWithOneTap(loginDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Login successful');
            expect(result.data).toEqual(mockLoginResponse);
        });
    });

    describe('loginWithSocial', () => {
        const loginDto = {
            provider: 'wechat' as const,
            accessToken: 'social-access-token-123',
            idToken: 'id-token-123',
            deviceId: 'device-123',
            rememberMe: false,
        };

        it('should login successfully', async () => {
            mockAuthService.loginWithSocial.mockResolvedValue(mockLoginResponse);

            const result = await controller.loginWithSocial(loginDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Login successful');
            expect(result.data).toEqual(mockLoginResponse);
        });
    });

    describe('sendSmsCode', () => {
        const sendSmsDto = {
            phone: '+1234567890',
            type: 'login' as const,
            deviceId: 'device-123',
        };

        it('should send SMS code successfully', async () => {
            const mockSmsResponse = {
                success: true,
                message: 'SMS code sent successfully',
                expiryMinutes: 5,
            };

            mockAuthService.sendSmsCode.mockResolvedValue(mockSmsResponse);

            const result = await controller.sendSmsCode(sendSmsDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('SMS code sent successfully');
            expect(result.data).toEqual({
                ...mockSmsResponse,
                retryAfterSeconds: 60,
            });
        });
    });

    describe('verifySmsCode', () => {
        const verifyDto = {
            phone: '+1234567890',
            code: '123456',
            type: 'login' as const,
        };

        it('should verify SMS code successfully', async () => {
            mockAuthService.verifySmsCode.mockResolvedValue(true);

            const result = await controller.verifySmsCode(verifyDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('SMS code verified successfully');
            expect(result.data).toEqual({
                success: true,
                verified: true,
            });
        });

        it('should handle invalid SMS code', async () => {
            mockAuthService.verifySmsCode.mockResolvedValue(false);

            const result = await controller.verifySmsCode(verifyDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.BAD_REQUEST);
            expect(result.message).toBe('Invalid or expired SMS code');
            expect(result.data).toEqual({
                success: false,
                verified: false,
            });
        });
    });

    describe('refreshToken', () => {
        const refreshDto = {
            refreshToken: 'valid-refresh-token',
        };

        it('should refresh token successfully', async () => {
            const mockRefreshResponse = {
                accessToken: 'new-jwt-token',
                refreshToken: 'new-refresh-token',
                tokenType: 'Bearer' as const,
                expiresIn: 3600,
                refreshExpiresIn: 30 * 24 * 60 * 60,
            };

            mockAuthService.refreshToken.mockResolvedValue(mockRefreshResponse);

            const result = await controller.refreshToken(refreshDto);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Token refreshed successfully');
            expect(result.data).toEqual(mockRefreshResponse);
        });
    });

    describe('logout', () => {
        const logoutDto = {
            refreshToken: 'valid-refresh-token',
            deviceId: 'device-123',
            logoutFromAllDevices: false,
        };

        const mockRequest = {
            user: {
                sub: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                phone: '+1234567890',
            },
        };

        it('should logout successfully', async () => {
            const mockLogoutResponse = {
                success: true,
                message: 'Logged out successfully',
                sessionsTerminated: 1,
            };

            mockAuthService.logout.mockResolvedValue(mockLogoutResponse);

            const result = await controller.logout(logoutDto, mockRequest);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('Logout successful');
            expect(result.data).toEqual(mockLogoutResponse);
            expect(mockAuthService.logout).toHaveBeenCalledWith(logoutDto, 'user-id');
        });

        it('should logout from all devices', async () => {
            const logoutAllDto = { ...logoutDto, logoutFromAllDevices: true };
            const mockLogoutResponse = {
                success: true,
                message: 'Logged out successfully',
                sessionsTerminated: 3,
            };

            mockAuthService.logout.mockResolvedValue(mockLogoutResponse);

            const result = await controller.logout(logoutAllDto, mockRequest);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.data.sessionsTerminated).toBe(3);
        });
    });

    describe('getProfile', () => {
        const mockRequest = {
            user: {
                sub: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                phone: '+1234567890',
            },
        };

        it('should return user profile', async () => {
            const result = await controller.getProfile(mockRequest);

            expect(result).toBeInstanceOf(ResponseDto);
            expect(result.statusCode).toBe(HttpStatus.OK);
            expect(result.message).toBe('User profile retrieved successfully');
            expect(result.data).toEqual({
                id: 'user-id',
                username: 'testuser',
                email: 'test@example.com',
                phone: '+1234567890',
            });
        });
    });
}); 