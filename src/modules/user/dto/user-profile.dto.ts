import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    Max,
    Matches,
    ArrayNotEmpty,
} from 'class-validator';
import {
    ActivityLevel,
    HealthCondition,
    HealthGoal,
} from '../schemas/user-profile.schema';

/**
 * Sleep schedule DTO
 */
export class SleepScheduleDto {
    @ApiProperty({
        description: 'Bedtime in HH:mm format',
        example: '23:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Bedtime must be in HH:mm format',
    })
    bedtime: string;

    @ApiProperty({
        description: 'Wake time in HH:mm format',
        example: '07:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Wake time must be in HH:mm format',
    })
    wakeTime: string;

    @ApiProperty({
        description: 'Average hours of sleep',
        example: 8,
        minimum: 4,
        maximum: 12,
    })
    @IsNumber()
    @Min(4)
    @Max(12)
    averageHours: number;
}

/**
 * Create user profile DTO for onboarding
 */
export class CreateUserProfileDto {
    @ApiProperty({
        description: 'User gender',
        enum: ['male', 'female', 'other'],
        example: 'male',
    })
    @IsString()
    @IsEnum(['male', 'female', 'other'])
    gender: string;

    @ApiProperty({
        description: 'User age',
        example: 25,
        minimum: 10,
        maximum: 120,
    })
    @IsNumber()
    @Min(10)
    @Max(120)
    age: number;

    @ApiProperty({
        description: 'User height in centimeters',
        example: 175,
        minimum: 100,
        maximum: 250,
    })
    @IsNumber()
    @Min(100)
    @Max(250)
    height: number;

    @ApiProperty({
        description: 'User weight in kilograms',
        example: 70,
        minimum: 30,
        maximum: 300,
    })
    @IsNumber()
    @Min(30)
    @Max(300)
    weight: number;

    @ApiProperty({
        description: 'User activity level',
        enum: ActivityLevel,
        example: ActivityLevel.MODERATELY_ACTIVE,
    })
    @IsEnum(ActivityLevel)
    activityLevel: ActivityLevel;

    @ApiPropertyOptional({
        description: 'User sleep schedule',
        type: SleepScheduleDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => SleepScheduleDto)
    sleepSchedule?: SleepScheduleDto;

    @ApiPropertyOptional({
        description: 'User health conditions',
        enum: HealthCondition,
        isArray: true,
        example: [HealthCondition.NONE],
    })
    @IsOptional()
    @IsArray()
    @IsEnum(HealthCondition, { each: true })
    healthConditions?: HealthCondition[];

    @ApiPropertyOptional({
        description: 'User allergies',
        isArray: true,
        example: ['花生', '海鲜'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergies?: string[];

    @ApiProperty({
        description: 'User main health goal',
        enum: HealthGoal,
        example: HealthGoal.WEIGHT_LOSS,
    })
    @IsEnum(HealthGoal)
    mainGoal: HealthGoal;

    @ApiPropertyOptional({
        description: 'Target weight in kilograms',
        example: 65,
        minimum: 30,
        maximum: 300,
    })
    @IsOptional()
    @IsNumber()
    @Min(30)
    @Max(300)
    targetWeight?: number;

    @ApiPropertyOptional({
        description: 'Goal timeline in weeks',
        example: 12,
        minimum: 1,
        maximum: 52,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(52)
    goalTimeline?: number;
}

/**
 * Update user profile DTO
 */
export class UpdateUserProfileDto extends PartialType(CreateUserProfileDto) { }

/**
 * User profile response DTO
 */
export class UserProfileResponseDto {
    @ApiProperty({
        description: 'Profile ID',
        example: '64a7b3c1234567890abcdef0',
    })
    _id: string;

    @ApiProperty({
        description: 'User ID',
        example: '64a7b3c1234567890abcdef1',
    })
    userId: string;

    @ApiProperty({
        description: 'User gender',
        enum: ['male', 'female', 'other'],
        example: 'male',
    })
    gender: string;

    @ApiProperty({
        description: 'User age',
        example: 25,
    })
    age: number;

    @ApiProperty({
        description: 'User height in centimeters',
        example: 175,
    })
    height: number;

    @ApiProperty({
        description: 'User weight in kilograms',
        example: 70,
    })
    weight: number;

    @ApiProperty({
        description: 'User activity level',
        enum: ActivityLevel,
        example: ActivityLevel.MODERATELY_ACTIVE,
    })
    activityLevel: ActivityLevel;

    @ApiPropertyOptional({
        description: 'User sleep schedule',
        type: SleepScheduleDto,
    })
    sleepSchedule?: SleepScheduleDto;

    @ApiPropertyOptional({
        description: 'User health conditions',
        enum: HealthCondition,
        isArray: true,
    })
    healthConditions?: HealthCondition[];

    @ApiPropertyOptional({
        description: 'User allergies',
        isArray: true,
    })
    allergies?: string[];

    @ApiProperty({
        description: 'User main health goal',
        enum: HealthGoal,
    })
    mainGoal: HealthGoal;

    @ApiPropertyOptional({
        description: 'Target weight in kilograms',
    })
    targetWeight?: number;

    @ApiPropertyOptional({
        description: 'Goal timeline in weeks',
    })
    goalTimeline?: number;

    @ApiProperty({
        description: 'Calculated BMI',
        example: 22.86,
    })
    bmi: number;

    @ApiProperty({
        description: 'BMI category',
        example: 'normal',
        enum: ['underweight', 'normal', 'overweight', 'obese'],
    })
    bmiCategory: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-07-07T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-07-07T10:30:00.000Z',
    })
    updatedAt: Date;
} 