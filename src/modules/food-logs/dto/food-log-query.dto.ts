import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsDateString,
    IsEnum,
    IsNumber,
    IsString,
    Min,
    Max,
} from 'class-validator';

export class FoodLogQueryDto {
    @ApiProperty({
        description: 'Start date for filtering logs',
        example: '2024-01-01',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    startDate?: string;

    @ApiProperty({
        description: 'End date for filtering logs',
        example: '2024-01-31',
        required: false,
    })
    @IsOptional()
    @IsDateString()
    endDate?: string;

    @ApiProperty({
        description: 'Filter by meal type',
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        required: false,
    })
    @IsOptional()
    @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
    mealType?: string;

    @ApiProperty({
        description: 'Filter by food name (partial match)',
        example: 'apple',
        required: false,
    })
    @IsOptional()
    @IsString()
    foodName?: string;

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
        enum: ['consumedAt', 'foodName', 'calories'],
        default: 'consumedAt',
        required: false,
    })
    @IsOptional()
    @IsEnum(['consumedAt', 'foodName', 'calories'])
    sortBy?: string = 'consumedAt';

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