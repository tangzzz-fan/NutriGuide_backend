import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Transform } from 'class-transformer';

/**
 * 用户信息响应DTO (用于登录响应)
 */
export class AuthUserResponseDto {
    @ApiProperty({
        description: 'User ID',
        example: '507f1f77bcf86cd799439011',
    })
    @Expose()
    @Transform(({ obj }) => obj._id?.toString() || obj.id)
    id: string;

    @ApiProperty({
        description: 'Username',
        example: 'johndoe',
    })
    @Expose()
    username: string;

    @ApiProperty({
        description: 'Email address',
        example: 'john@example.com',
    })
    @Expose()
    email: string;

    @ApiProperty({
        description: 'First name',
        example: 'John',
    })
    @Expose()
    firstName: string;

    @ApiProperty({
        description: 'Last name',
        example: 'Doe',
    })
    @Expose()
    lastName: string;

    @ApiProperty({
        description: 'Full name',
        example: 'John Doe',
    })
    @Expose()
    fullName: string;

    @ApiPropertyOptional({
        description: 'Phone number',
        example: '+8613812345678',
    })
    @Expose()
    phone?: string;

    @ApiProperty({
        description: 'Email verification status',
        example: true,
    })
    @Expose()
    isEmailVerified: boolean;

    @ApiProperty({
        description: 'Account active status',
        example: true,
    })
    @Expose()
    isActive: boolean;

    @ApiPropertyOptional({
        description: 'Last login time',
        example: '2024-01-15T10:30:00Z',
    })
    @Expose()
    lastLoginAt?: Date;

    @ApiProperty({
        description: 'Account creation time',
        example: '2024-01-01T00:00:00Z',
    })
    @Expose()
    createdAt: Date;

    // 排除敏感字段
    @Exclude()
    password?: string;

    @Exclude()
    emailVerificationToken?: string;

    @Exclude()
    passwordResetToken?: string;

    @Exclude()
    passwordResetExpires?: Date;
}

/**
 * 登录成功响应DTO
 */
export class LoginResponseDto {
    @ApiProperty({
        description: 'User information',
        type: AuthUserResponseDto,
    })
    user: AuthUserResponseDto;

    @ApiProperty({
        description: 'JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'Refresh token',
        example: 'refresh-token-abc123def456',
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Token type',
        example: 'Bearer',
    })
    tokenType: 'Bearer';

    @ApiProperty({
        description: 'Access token expiry time in seconds',
        example: 3600,
    })
    expiresIn: number;

    @ApiPropertyOptional({
        description: 'Refresh token expiry time in seconds',
        example: 2592000,
    })
    refreshExpiresIn?: number;
}

/**
 * Token刷新响应DTO
 */
export class RefreshTokenResponseDto {
    @ApiProperty({
        description: 'New JWT access token',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    })
    accessToken: string;

    @ApiProperty({
        description: 'New refresh token',
        example: 'refresh-token-new123def456',
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Token type',
        example: 'Bearer',
    })
    tokenType: 'Bearer';

    @ApiProperty({
        description: 'Access token expiry time in seconds',
        example: 3600,
    })
    expiresIn: number;

    @ApiPropertyOptional({
        description: 'Refresh token expiry time in seconds',
        example: 2592000,
    })
    refreshExpiresIn?: number;
}

/**
 * 登出响应DTO
 */
export class LogoutResponseDto {
    @ApiProperty({
        description: 'Success status',
        example: true,
    })
    success: boolean;

    @ApiProperty({
        description: 'Response message',
        example: 'Logged out successfully',
    })
    message: string;

    @ApiPropertyOptional({
        description: 'Number of sessions terminated',
        example: 1,
    })
    sessionsTerminated?: number;
}

/**
 * 用户注册响应DTO
 */
export class RegisterResponseDto {
    @ApiProperty({
        description: 'User information',
        type: AuthUserResponseDto,
    })
    user: AuthUserResponseDto;

    @ApiProperty({
        description: 'Success message',
        example: 'User registered successfully',
    })
    message: string;

    @ApiPropertyOptional({
        description: 'Whether email verification is required',
        example: true,
    })
    requiresEmailVerification?: boolean;

    @ApiPropertyOptional({
        description: 'Whether phone verification is required',
        example: false,
    })
    requiresPhoneVerification?: boolean;
} 