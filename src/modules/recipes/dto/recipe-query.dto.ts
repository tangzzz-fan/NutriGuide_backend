import { ApiProperty } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsArray,
    IsNumber,
    IsEnum,
    IsBoolean,
    Min,
    Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class RecipeQueryDto {
    @ApiProperty({
        description: 'Search term for recipe name or description',
        example: 'chicken',
        required: false,
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiProperty({
        description: 'Filter by categories',
        example: ['dinner', 'healthy'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    categories?: string[];

    @ApiProperty({
        description: 'Filter by tags',
        example: ['low-carb', 'high-protein'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    tags?: string[];

    @ApiProperty({
        description: 'Filter by difficulty level',
        enum: ['easy', 'medium', 'hard'],
        example: 'easy',
        required: false,
    })
    @IsOptional()
    @IsEnum(['easy', 'medium', 'hard'])
    difficulty?: string;

    @ApiProperty({
        description: 'Minimum preparation time in minutes',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    minPrepTime?: number;

    @ApiProperty({
        description: 'Maximum preparation time in minutes',
        example: 60,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    maxPrepTime?: number;

    @ApiProperty({
        description: 'Minimum cooking time in minutes',
        example: 15,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    minCookTime?: number;

    @ApiProperty({
        description: 'Maximum cooking time in minutes',
        example: 120,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    maxCookTime?: number;

    @ApiProperty({
        description: 'Minimum number of servings',
        example: 2,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    minServings?: number;

    @ApiProperty({
        description: 'Maximum number of servings',
        example: 8,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    maxServings?: number;

    @ApiProperty({
        description: 'Filter by user ID (for getting user-specific recipes)',
        example: '507f1f77bcf86cd799439011',
        required: false,
    })
    @IsOptional()
    @IsString()
    userId?: string;

    @ApiProperty({
        description: 'Include only public recipes',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isPublic?: boolean;

    @ApiProperty({
        description: 'Include only favorited recipes for the user',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    favoritesOnly?: boolean;

    @ApiProperty({
        description: 'Sort field',
        enum: ['name', 'rating', 'createdAt', 'views', 'prepTime', 'cookTime'],
        example: 'rating',
        required: false,
    })
    @IsOptional()
    @IsEnum(['name', 'rating', 'createdAt', 'views', 'prepTime', 'cookTime'])
    sortBy?: string;

    @ApiProperty({
        description: 'Sort direction',
        enum: ['asc', 'desc'],
        example: 'desc',
        required: false,
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc';

    @ApiProperty({
        description: 'Page number for pagination',
        example: 1,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    page?: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    limit?: number;
} 