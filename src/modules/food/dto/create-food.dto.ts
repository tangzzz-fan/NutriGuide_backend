import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsArray,
    IsNumber,
    Min,
    Max,
    MaxLength,
    IsBoolean,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateNutritionDto {
    @ApiProperty({
        description: 'Calories per 100g',
        example: 250,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    calories: number;

    @ApiProperty({
        description: 'Protein content in grams per 100g',
        example: 15.5,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    protein: number;

    @ApiProperty({
        description: 'Carbohydrates content in grams per 100g',
        example: 45.2,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    carbohydrates: number;

    @ApiProperty({
        description: 'Fat content in grams per 100g',
        example: 8.7,
        minimum: 0,
    })
    @IsNumber()
    @Min(0)
    fat: number;

    @ApiPropertyOptional({
        description: 'Fiber content in grams per 100g',
        example: 3.2,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    fiber?: number;

    @ApiPropertyOptional({
        description: 'Sugar content in grams per 100g',
        example: 12.5,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sugar?: number;

    @ApiPropertyOptional({
        description: 'Sodium content in mg per 100g',
        example: 400,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sodium?: number;

    @ApiPropertyOptional({
        description: 'Potassium content in mg per 100g',
        example: 300,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    potassium?: number;

    @ApiPropertyOptional({
        description: 'Calcium content in mg per 100g',
        example: 120,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    calcium?: number;

    @ApiPropertyOptional({
        description: 'Iron content in mg per 100g',
        example: 2.5,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    iron?: number;

    @ApiPropertyOptional({
        description: 'Vitamin C content in mg per 100g',
        example: 15,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    vitaminC?: number;

    @ApiPropertyOptional({
        description: 'Vitamin A content in mcg per 100g',
        example: 500,
        minimum: 0,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    vitaminA?: number;
}

export class CreateFoodDto {
    @ApiProperty({
        description: 'Food name in Chinese',
        example: '苹果',
        maxLength: 100,
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(100)
    name: string;

    @ApiPropertyOptional({
        description: 'Food name in English',
        example: 'Apple',
        maxLength: 100,
    })
    @IsOptional()
    @IsString()
    @MaxLength(100)
    nameEn?: string;

    @ApiPropertyOptional({
        description: 'Food description',
        example: 'Fresh red apple with crispy texture',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
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
    category: string;

    @ApiPropertyOptional({
        description: 'Food subcategories for more specific classification',
        example: ['red_apple', 'seasonal_fruit'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    subcategories?: string[];

    @ApiProperty({
        description: 'Nutritional information per 100g',
        type: CreateNutritionDto,
    })
    @ValidateNested()
    @Type(() => CreateNutritionDto)
    nutrition: CreateNutritionDto;

    @ApiPropertyOptional({
        description: 'Common serving units',
        example: ['piece', 'cup', 'slice'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    commonUnits?: string[];

    @ApiPropertyOptional({
        description: 'Known allergens',
        example: ['tree_nuts'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    allergens?: string[];

    @ApiPropertyOptional({
        description: 'Dietary tags',
        example: ['vegetarian', 'vegan', 'gluten_free'],
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dietaryTags?: string[];

    @ApiPropertyOptional({
        description: 'Barcode for packaged foods',
        example: '1234567890123',
    })
    @IsOptional()
    @IsString()
    barcode?: string;

    @ApiPropertyOptional({
        description: 'Brand name for packaged foods',
        example: 'Fresh Valley',
    })
    @IsOptional()
    @IsString()
    brand?: string;

    @ApiPropertyOptional({
        description: 'Image URL',
        example: 'https://example.com/images/apple.jpg',
    })
    @IsOptional()
    @IsString()
    imageUrl?: string;

    @ApiPropertyOptional({
        description: 'Data source',
        example: 'usda',
        enum: ['usda', 'manual', 'api_import', 'user_contributed'],
    })
    @IsOptional()
    @IsEnum(['usda', 'manual', 'api_import', 'user_contributed'])
    dataSource?: string;

    @ApiPropertyOptional({
        description: 'Reference to original data source',
        example: 'USDA Food Data Central ID: 171688',
    })
    @IsOptional()
    @IsString()
    sourceReference?: string;
} 