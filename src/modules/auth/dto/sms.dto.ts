import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Matches, IsEnum, IsOptional } from 'class-validator';

/**
 * 发送SMS验证码
 */
export class SendSmsCodeDto {
    @ApiProperty({
        description: 'Phone number to send SMS code to',
        example: '+8613812345678',
    })
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Please provide a valid phone number',
    })
    phone: string;

    @ApiProperty({
        description: 'SMS code type',
        enum: ['login', 'register', 'reset-password', 'phone-verification'],
        example: 'login',
    })
    @IsEnum(['login', 'register', 'reset-password', 'phone-verification'], {
        message: 'Type must be one of: login, register, reset-password, phone-verification',
    })
    type: 'login' | 'register' | 'reset-password' | 'phone-verification';

    @ApiPropertyOptional({
        description: 'Device ID for tracking',
        example: 'device-123-456',
    })
    @IsOptional()
    @IsString()
    deviceId?: string;
}

/**
 * 验证SMS代码
 */
export class VerifySmsCodeDto {
    @ApiProperty({
        description: 'Phone number',
        example: '+8613812345678',
    })
    @IsString({ message: 'Phone number must be a string' })
    @IsNotEmpty({ message: 'Phone number is required' })
    @Matches(/^\+?[1-9]\d{1,14}$/, {
        message: 'Please provide a valid phone number',
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
    code: string;

    @ApiProperty({
        description: 'SMS code type',
        enum: ['login', 'register', 'reset-password', 'phone-verification'],
        example: 'login',
    })
    @IsEnum(['login', 'register', 'reset-password', 'phone-verification'], {
        message: 'Type must be one of: login, register, reset-password, phone-verification',
    })
    type: 'login' | 'register' | 'reset-password' | 'phone-verification';
}

/**
 * SMS验证码响应
 */
export class SmsCodeResponseDto {
    @ApiProperty({
        description: 'Success status',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'SMS code sent successfully',
    })
    message: string;

    @ApiProperty({
        description: 'Expiry time in minutes',
        example: 5,
    })
    expiryMinutes: number;

    @ApiPropertyOptional({
        description: 'Retry after seconds (rate limiting)',
        example: 60,
    })
    retryAfterSeconds?: number;

    @ApiPropertyOptional({
        description: 'Development environment note (only in development)',
        example: 'Development mode: You can use 123456 as a universal verification code to save SMS costs',
    })
    developmentNote?: string;
}