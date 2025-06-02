import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsOptional,
    IsString,
    IsEnum,
    IsArray,
    IsNumber,
    Min,
    Max,
    IsBoolean,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FoodQueryDto {
    @ApiPropertyOptional({
        description: 'Search term for food name, nameEn, or description',
        example: '苹果',
    })
    @IsOptional()
    @IsString()
    search?: string;

    @ApiPropertyOptional({
        description: 'Food category',
        example: 'fruits',
        enum: [
            'grains',
            'vegetables',
            'fruits',
            'meat',
            'poultry',
            'seafood',
            'dairy',
            'nuts',
            'legumes',
            'beverages',
            'snacks',
            'condiments',
            'oils',
            'other',
        ],
    })
    @IsOptional()
    @IsEnum([
        'grains',
        'vegetables',
        'fruits',
        'meat',
        'poultry',
        'seafood',
        'dairy',
        'nuts',
        'legumes',
        'beverages',
        'snacks',
        'condiments',
        'oils',
        'other',
    ])
    category?: string;

    @ApiPropertyOptional({
        description: 'Subcategories filter',
        example: ['red_apple'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    subcategories?: string[];

    @ApiPropertyOptional({
        description: 'Allergens filter (foods that do NOT contain these allergens)',
        example: ['gluten', 'dairy'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    excludeAllergens?: string[];

    @ApiPropertyOptional({
        description: 'Dietary tags filter',
        example: ['vegetarian', 'vegan'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
    dietaryTags?: string[];

    @ApiPropertyOptional({
        description: 'Brand filter',
        example: 'Fresh Valley',
    })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({
        description: 'Only show verified foods',
        example: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isVerified?: boolean;

    @ApiPropertyOptional({
        description: 'Only show active foods',
        example: true,
        default: true,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    isActive?: boolean = true;

    @ApiPropertyOptional({
        description: 'Data source filter',
        example: 'usda',
        enum: ['usda', 'manual', 'api_import', 'user_contributed'],
    })
    @IsOptional()
    @IsEnum(['usda', 'manual', 'api_import', 'user_contributed'])
    dataSource?: string;

    @ApiPropertyOptional({
        description: 'Page number',
        example: 1,
        minimum: 1,
        default: 1,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'Items per page',
        example: 20,
        minimum: 1,
        maximum: 100,
        default: 20,
    })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number = 20;

    @ApiPropertyOptional({
        description: 'Sort field',
        example: 'name',
        enum: ['name', 'category', 'createdAt', 'updatedAt', 'calories'],
    })
    @IsOptional()
    @IsEnum(['name', 'category', 'createdAt', 'updatedAt', 'calories'])
    sortBy?: string = 'name';

    @ApiPropertyOptional({
        description: 'Sort order',
        example: 'asc',
        enum: ['asc', 'desc'],
    })
    @IsOptional()
    @IsEnum(['asc', 'desc'])
    sortOrder?: 'asc' | 'desc' = 'asc';
} 