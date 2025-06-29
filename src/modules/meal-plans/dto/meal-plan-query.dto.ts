import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsDateString,
    IsEnum,
    IsNumber,
    IsString,
    IsBoolean,
    Min,
    Max,
} from 'class-validator';

export class MealPlanQueryDto {
    @ApiProperty({
        description: 'Filter by meal plan type',
        enum: ['daily', 'weekly', 'custom'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['daily', 'weekly', 'custom'])
    type?: string;

    @ApiProperty({
        description: 'Filter by status',
        enum: ['draft', 'active', 'completed', 'archived'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['draft', 'active', 'completed', 'archived'])
    status?: string;

    @ApiProperty({
        description: 'Filter by goal',
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'])
    goal?: string;

    @ApiProperty({
        description: 'Filter by plan name (partial match)',
        example: 'healthy',
        required: false,
    })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({
        description: 'Filter by start date (from)',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDateFrom?: string;

    @ApiProperty({
        description: 'Filter by start date (to)',
        example: '2024-01-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDateTo?: string;

    @ApiProperty({
        description: 'Filter templates only',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isTemplate?: boolean;

    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        minimum: 1,
        default: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        minimum: 1,
        maximum: 100,
        default: 10,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 10;

    @ApiProperty({
        description: 'Sort field',
        enum: ['name', 'startDate', 'createdAt', 'status'],
        default: 'createdAt',
        required: false,
    })
    @IsOptional()
    @IsEnum(['name', 'startDate', 'createdAt', 'status'])
    sortBy?: string = 'createdAt';

    @ApiProperty({
        description: 'Sort order',
        enum: ['asc', 'desc'],
        default: 'desc',
        required: false,
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: string = 'desc';
} 