import { ApiProperty } from '@nestjs/swagger';

export class ConsumedNutritionDto {
    @ApiProperty({ description: 'Calories consumed (kcal)', example: 150 })
    calories: number;

    @ApiProperty({ description: 'Protein consumed (grams)', example: 5.2 })
    protein: number;

    @ApiProperty({ description: 'Carbohydrates consumed (grams)', example: 35.1 })
    carbohydrates: number;

    @ApiProperty({ description: 'Fat consumed (grams)', example: 0.3 })
    fat: number;

    @ApiProperty({ description: 'Fiber consumed (grams)', example: 2.5, required: false })
    fiber?: number;

    @ApiProperty({ description: 'Sugar consumed (grams)', example: 18.2, required: false })
    sugar?: number;

    @ApiProperty({ description: 'Sodium consumed (mg)', example: 2, required: false })
    sodium?: number;

    @ApiProperty({ description: 'Potassium consumed (mg)', example: 195, required: false })
    potassium?: number;

    @ApiProperty({ description: 'Calcium consumed (mg)', example: 6, required: false })
    calcium?: number;

    @ApiProperty({ description: 'Iron consumed (mg)', example: 0.12, required: false })
    iron?: number;

    @ApiProperty({ description: 'Vitamin C consumed (mg)', example: 4.6, required: false })
    vitaminC?: number;

    @ApiProperty({ description: 'Vitamin A consumed (mcg)', example: 3, required: false })
    vitaminA?: number;
}

export class FoodLogResponseDto {
    @ApiProperty({ description: 'Food log ID', example: '507f1f77bcf86cd799439011' })
    _id: string;

    @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: 'Food ID', example: '507f1f77bcf86cd799439011' })
    foodId: string;

    @ApiProperty({ description: 'Food name', example: 'Apple' })
    foodName: string;

    @ApiProperty({ description: 'Consumption date and time', example: '2024-01-27T12:30:00.000Z' })
    consumedAt: Date;

    @ApiProperty({ description: 'Meal type', enum: ['breakfast', 'lunch', 'dinner', 'snack'], example: 'lunch' })
    mealType: string;

    @ApiProperty({ description: 'Quantity consumed', example: 150 })
    quantity: number;

    @ApiProperty({ description: 'Unit of measurement', example: 'grams' })
    unit: string;

    @ApiProperty({ description: 'Weight in grams', example: 150 })
    weight: number;

    @ApiProperty({ description: 'Nutrition information for consumed amount' })
    nutrition: ConsumedNutritionDto;

    @ApiProperty({ description: 'User notes', example: 'Had this for lunch at the office', required: false })
    notes?: string;

    @ApiProperty({ description: 'Custom tags', example: ['office', 'healthy'], required: false })
    tags?: string[];

    @ApiProperty({ description: 'Creation date', example: '2024-01-27T12:30:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date', example: '2024-01-27T12:30:00.000Z' })
    updatedAt: Date;
}

export class FoodLogListResponseDto {
    @ApiProperty({ description: 'Array of food logs', type: [FoodLogResponseDto] })
    items: FoodLogResponseDto[];

    @ApiProperty({ description: 'Total number of logs', example: 150 })
    total: number;

    @ApiProperty({ description: 'Current page', example: 1 })
    page: number;

    @ApiProperty({ description: 'Items per page', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Total pages', example: 15 })
    totalPages: number;
} 