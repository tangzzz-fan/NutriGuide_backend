import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NutritionResponseDto {
    @ApiProperty({
        description: 'Calories per 100g',
        example: 250,
    })
    calories: number;

    @ApiProperty({
        description: 'Protein content in grams per 100g',
        example: 15.5,
    })
    protein: number;

    @ApiProperty({
        description: 'Carbohydrates content in grams per 100g',
        example: 45.2,
    })
    carbohydrates: number;

    @ApiProperty({
        description: 'Fat content in grams per 100g',
        example: 8.7,
    })
    fat: number;

    @ApiPropertyOptional({
        description: 'Fiber content in grams per 100g',
        example: 3.2,
    })
    fiber?: number;

    @ApiPropertyOptional({
        description: 'Sugar content in grams per 100g',
        example: 12.5,
    })
    sugar?: number;

    @ApiPropertyOptional({
        description: 'Sodium content in mg per 100g',
        example: 400,
    })
    sodium?: number;

    @ApiPropertyOptional({
        description: 'Potassium content in mg per 100g',
        example: 300,
    })
    potassium?: number;

    @ApiPropertyOptional({
        description: 'Calcium content in mg per 100g',
        example: 120,
    })
    calcium?: number;

    @ApiPropertyOptional({
        description: 'Iron content in mg per 100g',
        example: 2.5,
    })
    iron?: number;

    @ApiPropertyOptional({
        description: 'Vitamin C content in mg per 100g',
        example: 15,
    })
    vitaminC?: number;

    @ApiPropertyOptional({
        description: 'Vitamin A content in mcg per 100g',
        example: 500,
    })
    vitaminA?: number;
}

export class FoodResponseDto {
    @ApiProperty({
        description: 'Food ID',
        example: '507f1f77bcf86cd799439011',
    })
    _id: string;

    @ApiProperty({
        description: 'Food name in Chinese',
        example: '苹果',
    })
    name: string;

    @ApiPropertyOptional({
        description: 'Food name in English',
        example: 'Apple',
    })
    nameEn?: string;

    @ApiProperty({
        description: 'Display name (computed field)',
        example: '苹果',
    })
    displayName: string;

    @ApiPropertyOptional({
        description: 'Food description',
        example: 'Fresh red apple with crispy texture',
    })
    description?: string;

    @ApiProperty({
        description: 'Food category',
        example: 'fruits',
    })
    category: string;

    @ApiPropertyOptional({
        description: 'Food subcategories',
        example: ['red_apple', 'seasonal_fruit'],
        type: [String],
    })
    subcategories?: string[];

    @ApiProperty({
        description: 'Nutritional information per 100g',
        type: NutritionResponseDto,
    })
    nutrition: NutritionResponseDto;

    @ApiPropertyOptional({
        description: 'Common serving units',
        example: ['piece', 'cup', 'slice'],
        type: [String],
    })
    commonUnits?: string[];

    @ApiPropertyOptional({
        description: 'Known allergens',
        example: ['tree_nuts'],
        type: [String],
    })
    allergens?: string[];

    @ApiPropertyOptional({
        description: 'Dietary tags',
        example: ['vegetarian', 'vegan', 'gluten_free'],
        type: [String],
    })
    dietaryTags?: string[];

    @ApiPropertyOptional({
        description: 'Barcode for packaged foods',
        example: '1234567890123',
    })
    barcode?: string;

    @ApiPropertyOptional({
        description: 'Brand name for packaged foods',
        example: 'Fresh Valley',
    })
    brand?: string;

    @ApiPropertyOptional({
        description: 'Image URL',
        example: 'https://example.com/images/apple.jpg',
    })
    imageUrl?: string;

    @ApiProperty({
        description: 'Whether the food is active',
        example: true,
    })
    isActive: boolean;

    @ApiProperty({
        description: 'Whether nutrition data has been verified',
        example: false,
    })
    isVerified: boolean;

    @ApiPropertyOptional({
        description: 'Data source',
        example: 'usda',
    })
    dataSource?: string;

    @ApiPropertyOptional({
        description: 'Reference to original data source',
        example: 'USDA Food Data Central ID: 171688',
    })
    sourceReference?: string;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-12-01T10:00:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-12-01T10:00:00.000Z',
    })
    updatedAt: Date;
}

export class FoodListResponseDto {
    @ApiProperty({
        description: 'List of foods',
        type: [FoodResponseDto],
    })
    foods: FoodResponseDto[];

    @ApiProperty({
        description: 'Pagination information',
        example: {
            currentPage: 1,
            totalPages: 5,
            totalCount: 100,
            hasNextPage: true,
            hasPreviousPage: false,
        },
    })
    pagination: {
        currentPage: number;
        totalPages: number;
        totalCount: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
} 