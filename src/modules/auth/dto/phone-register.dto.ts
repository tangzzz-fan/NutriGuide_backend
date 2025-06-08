import {
    IsString,
    IsOptional,
    MinLength,
    MaxLength,
    Matches,
    IsNotEmpty,
    IsDateString,
    IsEnum,
    IsBoolean,
    IsEmail,
    IsNumber,
    Min,
    Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PhoneRegisterDto {
    @ApiProperty({
        description: 'User phone number (required). Can include country code with + prefix or without.',
        example: '+8613800138000 or 13800138000',
        pattern: '^(\\+?[1-9]\\d{1,14}|1[3-9]\\d{9})$',
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
    @MinLength(4, { message: 'SMS code must be at least 4 characters long' })
    @MaxLength(8, { message: 'SMS code must not exceed 8 characters' })
    smsCode: string;

    @ApiPropertyOptional({
        description: 'User email address',
        example: 'user@example.com',
        format: 'email',
    })
    @IsOptional()
    @IsEmail({}, { message: 'Please provide a valid email address' })
    email?: string;

    @ApiPropertyOptional({
        description: 'Unique username',
        example: 'johndoe123',
        minLength: 3,
        maxLength: 30,
    })
    @IsOptional()
    @IsString({ message: 'Username must be a string' })
    @MinLength(3, { message: 'Username must be at least 3 characters long' })
    @MaxLength(30, { message: 'Username must not exceed 30 characters' })
    @Matches(/^[a-zA-Z0-9_]+$/, {
        message: 'Username can only contain letters, numbers, and underscores',
    })
    username?: string;

    @ApiPropertyOptional({
        description: 'User password (optional, can be set later)',
        example: 'MySecurePass123!',
        minLength: 8,
    })
    @IsOptional()
    @IsString({ message: 'Password must be a string' })
    @MinLength(8, { message: 'Password must be at least 8 characters long' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message:
            'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password?: string;

    @ApiPropertyOptional({
        description: 'User first name',
        example: 'John',
        maxLength: 50,
    })
    @IsOptional()
    @IsString({ message: 'First name must be a string' })
    @MaxLength(50, { message: 'First name must not exceed 50 characters' })
    firstName?: string;

    @ApiPropertyOptional({
        description: 'User last name',
        example: 'Doe',
        maxLength: 50,
    })
    @IsOptional()
    @IsString({ message: 'Last name must be a string' })
    @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
    lastName?: string;

    @ApiPropertyOptional({
        description: 'User date of birth',
        example: '1990-01-15',
        format: 'date',
    })
    @IsOptional()
    @IsDateString({}, { message: 'Please provide a valid birth date' })
    birthDate?: string;

    @ApiPropertyOptional({
        description: 'User gender',
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        example: 'male',
    })
    @IsOptional()
    @IsEnum(['male', 'female', 'other', 'prefer-not-to-say'], {
        message: 'Gender must be one of: male, female, other, prefer-not-to-say',
    })
    gender?: 'male' | 'female' | 'other' | 'prefer-not-to-say';

    @ApiPropertyOptional({
        description: 'User height in centimeters',
        example: 175.5,
        minimum: 50,
        maximum: 300,
    })
    @IsOptional()
    @IsNumber({}, { message: 'Height must be a number' })
    @Min(50, { message: 'Height must be at least 50 cm' })
    @Max(300, { message: 'Height must not exceed 300 cm' })
    height?: number;

    @ApiPropertyOptional({
        description: 'User weight in kilograms',
        example: 70.5,
        minimum: 20,
        maximum: 500,
    })
    @IsOptional()
    @IsNumber({}, { message: 'Weight must be a number' })
    @Min(20, { message: 'Weight must be at least 20 kg' })
    @Max(500, { message: 'Weight must not exceed 500 kg' })
    weight?: number;

    @ApiPropertyOptional({
        description: 'User activity level',
        enum: ['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extra-active'],
        example: 'moderately-active',
    })
    @IsOptional()
    @IsEnum(['sedentary', 'lightly-active', 'moderately-active', 'very-active', 'extra-active'], {
        message: 'Activity level must be one of: sedentary, lightly-active, moderately-active, very-active, extra-active',
    })
    activityLevel?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extra-active';

    @ApiPropertyOptional({
        description: 'Device ID for session management',
        example: 'mobile-app-ios-12345',
    })
    @IsOptional()
    @IsString({ message: 'Device ID must be a string' })
    deviceId?: string;

    @ApiPropertyOptional({
        description: 'Remember login session for extended period',
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean({ message: 'Remember me must be a boolean' })
    rememberMe?: boolean;
}
