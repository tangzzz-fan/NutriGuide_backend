import { ApiProperty } from '@nestjs/swagger';

export class PlannedMealResponseDto {
    @ApiProperty({ description: 'Food ID', example: '507f1f77bcf86cd799439011' })
    foodId: string;

    @ApiProperty({ description: 'Food name', example: 'Grilled Chicken Breast' })
    foodName: string;

    @ApiProperty({ description: 'Planned quantity', example: 150 })
    quantity: number;

    @ApiProperty({ description: 'Unit of measurement', example: 'grams' })
    unit: string;

    @ApiProperty({ description: 'Weight in grams', example: 150 })
    weight: number;

    @ApiProperty({ description: 'Notes for this meal item', example: 'Seasoned with herbs', required: false })
    notes?: string;
}

export class DayMealPlanResponseDto {
    @ApiProperty({ description: 'Breakfast meals', type: [PlannedMealResponseDto] })
    breakfast: PlannedMealResponseDto[];

    @ApiProperty({ description: 'Lunch meals', type: [PlannedMealResponseDto] })
    lunch: PlannedMealResponseDto[];

    @ApiProperty({ description: 'Dinner meals', type: [PlannedMealResponseDto] })
    dinner: PlannedMealResponseDto[];

    @ApiProperty({ description: 'Snack meals', type: [PlannedMealResponseDto] })
    snack: PlannedMealResponseDto[];
}

export class MealPlanResponseDto {
    @ApiProperty({ description: 'Meal plan ID', example: '507f1f77bcf86cd799439011' })
    _id: string;

    @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
    userId: string;

    @ApiProperty({ description: 'Plan name', example: 'Week 1 Healthy Plan' })
    name: string;

    @ApiProperty({ description: 'Plan description', example: 'A balanced meal plan', required: false })
    description?: string;

    @ApiProperty({ description: 'Plan type', enum: ['daily', 'weekly', 'custom'], example: 'weekly' })
    type: string;

    @ApiProperty({ description: 'Start date', example: '2024-01-27T00:00:00.000Z' })
    startDate: Date;

    @ApiProperty({ description: 'End date', example: '2024-02-02T23:59:59.999Z' })
    endDate: Date;

    @ApiProperty({
        description: 'Meals organized by date',
        example: {
            '2024-01-27': {
                breakfast: [
                    {
                        foodId: '507f1f77bcf86cd799439011',
                        foodName: 'Oatmeal',
                        quantity: 50,
                        unit: 'grams',
                        weight: 50,
                    },
                ],
                lunch: [],
                dinner: [],
                snack: [],
            },
        },
    })
    meals: Record<string, DayMealPlanResponseDto>;

    @ApiProperty({ description: 'Custom tags', example: ['healthy', 'low-carb'], required: false })
    tags?: string[];

    @ApiProperty({
        description: 'Primary goal',
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'],
        example: 'weight_loss',
        required: false,
    })
    goal?: string;

    @ApiProperty({ description: 'Daily target calories', example: 2000, required: false })
    targetCalories?: number;

    @ApiProperty({ description: 'Plan status', enum: ['draft', 'active', 'completed', 'archived'], example: 'active' })
    status: string;

    @ApiProperty({ description: 'Is template', example: false })
    isTemplate: boolean;

    @ApiProperty({ description: 'Created by', enum: ['manual', 'ai_generated', 'template_based'], example: 'manual', required: false })
    createdBy?: string;

    @ApiProperty({ description: 'Creation date', example: '2024-01-27T12:30:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update date', example: '2024-01-27T12:30:00.000Z' })
    updatedAt: Date;
}

export class MealPlanListResponseDto {
    @ApiProperty({ description: 'Array of meal plans', type: [MealPlanResponseDto] })
    items: MealPlanResponseDto[];

    @ApiProperty({ description: 'Total number of plans', example: 25 })
    total: number;

    @ApiProperty({ description: 'Current page', example: 1 })
    page: number;

    @ApiProperty({ description: 'Items per page', example: 10 })
    limit: number;

    @ApiProperty({ description: 'Total pages', example: 3 })
    totalPages: number;
}

export class GenerateMealPlanDto {
    @ApiProperty({
        description: 'Goal for the meal plan generation',
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'],
        example: 'weight_loss',
    })
    goal: string;

    @ApiProperty({
        description: 'Target daily calories',
        example: 2000,
        minimum: 1000,
        maximum: 5000,
    })
    targetCalories: number;

    @ApiProperty({
        description: 'Number of days to generate',
        example: 7,
        minimum: 1,
        maximum: 30,
    })
    days: number;

    @ApiProperty({
        description: 'Dietary preferences/restrictions',
        example: ['vegetarian', 'gluten-free'],
        required: false,
        type: [String],
    })
    dietaryRestrictions?: string[];

    @ApiProperty({
        description: 'Preferred meal types to include',
        example: ['breakfast', 'lunch', 'dinner'],
        required: false,
        type: [String],
    })
    preferredMealTypes?: string[];
} 