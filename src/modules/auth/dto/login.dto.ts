import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsEmail,
    IsString,
    IsNotEmpty,
    MinLength,
    IsOptional,
    Matches,
    IsEnum,
} from 'class-validator';

/**
 * 基础登录DTO
 */
export class BaseLoginDto {
    @ApiPropertyOptional({
        description: 'Device ID for tracking login sessions',
        example: 'device-123-456',
    })
    @IsOptional()
    @IsString()
    deviceId?: string;

    @ApiPropertyOptional({
        description: 'Remember login session (longer expiry)',
        example: true,
    })
    @IsOptional()
    rememberMe?: boolean;
}

/**
 * 邮箱/用户名 + 密码登录
 */
export class EmailPasswordLoginDto extends BaseLoginDto {
    @ApiProperty({
        description: 'Email address or username',
        example: 'user@example.com',
    })
    @IsString({ message: 'Email or username must be a string' })
    @IsNotEmpty({ message: 'Email or username is required' })
    identifier: string;

    @ApiProperty({
        description: 'User password',
        example: 'MySecurePass123!',
        minLength: 6,
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}

/**
 * 手机号码 + 密码登录
 */
export class PhonePasswordLoginDto extends BaseLoginDto {
    @ApiProperty({
        description: 'Phone number. Can include country code with + prefix or without.',
        example: '+8613800138000 or 13800138000',
    })
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^(\+?[1-9]\d{1,14}|1[3-9]\d{9})$/, {
        message: 'Please provide a valid phone number. Examples: +8613800138000, 13800138000',
    })
    phone: string;

    @ApiProperty({
        description: 'User password',
        example: 'MySecurePass123!',
        minLength: 6,
    })
    @IsString({ message: 'Password must be a string' })
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    password: string;
}

/**
 * 手机验证码登录
 */
export class PhoneSmsLoginDto extends BaseLoginDto {
    @ApiProperty({
        description: 'Phone number. Can include country code with + prefix or without.',
        example: '+8613800138000 or 13800138000',
    })
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^(\+?[1-9]\d{1,14}|1[3-9]\d{9})$/, {
        message: 'Please provide a valid phone number. Examples: +8613800138000, 13800138000',
    })
    phone: string;

    @ApiProperty({
        description: 'SMS verification code',
        example: '123456',
        minLength: 4,
        maxLength: 8,
    })
    @IsString({ message: 'SMS code must be a string' })
    @IsNotEmpty({ message: 'SMS code is required' })
    @Matches(/^\d{4,8}$/, {
        message: 'SMS code must be 4-8 digits',
    })
    smsCode: string;
}

/**
 * 手机号一键登录（免密快速登录）
 */
export class PhoneOneTapLoginDto extends BaseLoginDto {
    @ApiProperty({
        description: 'Phone number. Can include country code with + prefix or without.',
        example: '+8613800138000 or 13800138000',
    })
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^(\+?[1-9]\d{1,14}|1[3-9]\d{9})$/, {
        message: 'Please provide a valid phone number. Examples: +8613800138000, 13800138000',
    })
    phone: string;

    @ApiProperty({
        description: 'One-tap verification token from mobile SDK',
        example: 'onetap-token-abc123',
    })
    @IsString({ message: 'One-tap token must be a string' })
    @IsNotEmpty({ message: 'One-tap token is required' })
    oneTapToken: string;
}

/**
 * 社交登录
 */
export class SocialLoginDto extends BaseLoginDto {
    @ApiProperty({
        description: 'Social login provider',
        enum: ['wechat', 'apple', 'google', 'facebook'],
        example: 'wechat',
    })
    @IsEnum(['wechat', 'apple', 'google', 'facebook'], {
        message: 'Provider must be one of: wechat, apple, google, facebook',
    })
    provider: 'wechat' | 'apple' | 'google' | 'facebook';

    @ApiProperty({
        description: 'Access token from social provider',
        example: 'social-access-token-123',
    })
    @IsString({ message: 'Access token must be a string' })
    @IsNotEmpty({ message: 'Access token is required' })
    accessToken: string;

    @ApiPropertyOptional({
        description: 'ID token from social provider (for Apple, Google)',
        example: 'id-token-123',
    })
    @IsOptional()
    @IsString()
    idToken?: string;
}

/**
 * 刷新Token
 */
export class RefreshTokenDto {
    @ApiProperty({
        description: 'Refresh token',
        example: 'refresh-token-abc123',
    })
    @IsString({ message: 'Refresh token must be a string' })
    @IsNotEmpty({ message: 'Refresh token is required' })
    refreshToken: string;
}

/**
 * 登出
 */
export class LogoutDto {
    @ApiPropertyOptional({
        description: 'Refresh token to invalidate',
        example: 'refresh-token-abc123',
    })
    @IsOptional()
    @IsString()
    refreshToken?: string;

    @ApiPropertyOptional({
        description: 'Device ID to logout from',
        example: 'device-123-456',
    })
    @IsOptional()
    @IsString()
    deviceId?: string;

    @ApiPropertyOptional({
        description: 'Logout from all devices',
        example: false,
    })
    @IsOptional()
    logoutFromAllDevices?: boolean;
} 