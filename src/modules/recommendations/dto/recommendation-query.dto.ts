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

export class RecommendationQueryDto {
    @ApiProperty({
        description: 'Type of recommendation',
        enum: ['foods', 'recipes', 'meal-plans'],
        example: 'foods',
    })
    @IsEnum(['foods', 'recipes', 'meal-plans'])
    type: 'foods' | 'recipes' | 'meal-plans';

    @ApiProperty({
        description: 'Number of recommendations to return',
        example: 10,
        required: false,
        minimum: 1,
        maximum: 50,
    })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(50)
    @Type(() => Number)
    limit?: number;

    @ApiProperty({
        description: 'User dietary preferences to consider',
        example: ['vegetarian', 'low-carb'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    dietaryTags?: string[];

    @ApiProperty({
        description: 'Allergens to avoid',
        example: ['nuts', 'dairy'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    allergens?: string[];

    @ApiProperty({
        description: 'Meal type for recommendations',
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        example: 'lunch',
        required: false,
    })
    @IsOptional()
    @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
    mealType?: string;

    @ApiProperty({
        description: 'Maximum calories per serving',
        example: 500,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    maxCalories?: number;

    @ApiProperty({
        description: 'Minimum protein per serving (in grams)',
        example: 20,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    minProtein?: number;

    @ApiProperty({
        description: 'Maximum preparation time in minutes (for recipes)',
        example: 30,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    maxPrepTime?: number;

    @ApiProperty({
        description: 'Exclude recently viewed items',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    excludeRecent?: boolean;

    @ApiProperty({
        description: 'Include only highly rated items',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true' || value === true)
    highRatedOnly?: boolean;

    @ApiProperty({
        description: 'Personalization level',
        enum: ['basic', 'moderate', 'high'],
        example: 'moderate',
        required: false,
    })
    @IsOptional()
    @IsEnum(['basic', 'moderate', 'high'])
    personalization?: string;
} 