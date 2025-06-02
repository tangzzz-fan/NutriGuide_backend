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
} from './dto/auth-response.dto';

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
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    @ApiBody({ type: EmailPasswordLoginDto })
    async loginWithEmail(@Body() loginDto: EmailPasswordLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithEmailPassword(loginDto);
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
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials',
    })
    @ApiBody({ type: PhonePasswordLoginDto })
    async loginWithPhone(@Body() loginDto: PhonePasswordLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithPhonePassword(loginDto);
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
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired SMS code',
    })
    @ApiBody({ type: PhoneSmsLoginDto })
    async loginWithSms(@Body() loginDto: PhoneSmsLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithPhoneSms(loginDto);
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
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid one-tap token',
    })
    @ApiBody({ type: PhoneOneTapLoginDto })
    async loginWithOneTap(@Body() loginDto: PhoneOneTapLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithPhoneOneTap(loginDto);
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
        type: LoginResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid social login token',
    })
    @ApiBody({ type: SocialLoginDto })
    async loginWithSocial(@Body() loginDto: SocialLoginDto): Promise<LoginResponseDto> {
        return this.authService.loginWithSocial(loginDto);
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
        type: SmsCodeResponseDto,
    })
    @ApiResponse({
        status: 400,
        description: 'SMS code already sent or rate limited',
    })
    @ApiBody({ type: SendSmsCodeDto })
    async sendSmsCode(@Body() sendSmsDto: SendSmsCodeDto): Promise<SmsCodeResponseDto> {
        const result = await this.authService.sendSmsCode(sendSmsDto);
        return {
            ...result,
            retryAfterSeconds: 60, // Rate limiting
        };
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
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'SMS code verified successfully' },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid or expired SMS code',
    })
    @ApiBody({ type: VerifySmsCodeDto })
    async verifySmsCode(@Body() verifyDto: VerifySmsCodeDto): Promise<{ success: boolean; message: string }> {
        const isValid = await this.authService.verifySmsCode(verifyDto);

        if (!isValid) {
            return {
                success: false,
                message: 'Invalid or expired SMS code',
            };
        }

        return {
            success: true,
            message: 'SMS code verified successfully',
        };
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
        type: RefreshTokenResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid or expired refresh token',
    })
    @ApiBody({ type: RefreshTokenDto })
    async refreshToken(@Body() refreshDto: RefreshTokenDto): Promise<RefreshTokenResponseDto> {
        return this.authService.refreshToken(refreshDto);
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
        type: LogoutResponseDto,
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    @ApiBody({ type: LogoutDto })
    async logout(@Body() logoutDto: LogoutDto, @Request() req): Promise<LogoutResponseDto> {
        const userId = req.user.sub;
        return this.authService.logout(logoutDto, userId);
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
            },
        },
    })
    @ApiResponse({
        status: 401,
        description: 'Unauthorized',
    })
    async getProfile(@Request() req): Promise<any> {
        const userId = req.user.sub;
        // This would typically use a separate UserService method
        // For now, return basic user info from the JWT payload
        return {
            id: userId,
            username: req.user.username,
            email: req.user.email,
            phone: req.user.phone,
        };
    }
} 