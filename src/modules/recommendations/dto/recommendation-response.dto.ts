import { ApiProperty } from '@nestjs/swagger';

export class FoodRecommendationDto {
    @ApiProperty({
        description: 'Food ID',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: 'Food name',
        example: 'Grilled Chicken Breast',
    })
    name: string;

    @ApiProperty({
        description: 'Food category',
        example: 'meat',
    })
    category: string;

    @ApiProperty({
        description: 'Calories per 100g',
        example: 165,
    })
    calories: number;

    @ApiProperty({
        description: 'Protein per 100g',
        example: 31,
    })
    protein: number;

    @ApiProperty({
        description: 'Recommendation score (0-100)',
        example: 85,
    })
    score: number;

    @ApiProperty({
        description: 'Reason for recommendation',
        example: 'High protein, matches your fitness goals',
    })
    reason: string;

    @ApiProperty({
        description: 'Dietary tags',
        example: ['high-protein', 'low-carb'],
    })
    dietaryTags: string[];

    @ApiProperty({
        description: 'Food image URL',
        example: 'https://example.com/images/chicken.jpg',
        required: false,
    })
    imageUrl?: string;
}

export class RecipeRecommendationDto {
    @ApiProperty({
        description: 'Recipe ID',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: 'Recipe name',
        example: 'Mediterranean Quinoa Bowl',
    })
    name: string;

    @ApiProperty({
        description: 'Recipe description',
        example: 'A healthy and delicious quinoa bowl with Mediterranean flavors',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Calories per serving',
        example: 350,
    })
    calories: number;

    @ApiProperty({
        description: 'Preparation time in minutes',
        example: 15,
    })
    prepTime: number;

    @ApiProperty({
        description: 'Cooking time in minutes',
        example: 20,
    })
    cookTime: number;

    @ApiProperty({
        description: 'Difficulty level',
        enum: ['easy', 'medium', 'hard'],
        example: 'easy',
    })
    difficulty: string;

    @ApiProperty({
        description: 'Recipe rating',
        example: 4.5,
    })
    rating: number;

    @ApiProperty({
        description: 'Recommendation score (0-100)',
        example: 92,
    })
    score: number;

    @ApiProperty({
        description: 'Reason for recommendation',
        example: 'Quick to prepare, matches your dietary preferences',
    })
    reason: string;

    @ApiProperty({
        description: 'Recipe tags',
        example: ['vegetarian', 'mediterranean', 'quick'],
    })
    tags: string[];

    @ApiProperty({
        description: 'Recipe images',
        example: ['https://example.com/images/quinoa-bowl.jpg'],
    })
    images: string[];
}

export class MealPlanRecommendationDto {
    @ApiProperty({
        description: 'Meal plan ID',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: 'Meal plan name',
        example: 'Weekly Keto Meal Plan',
    })
    name: string;

    @ApiProperty({
        description: 'Meal plan description',
        example: 'A balanced weekly meal plan following ketogenic diet principles',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'Target calories per day',
        example: 1800,
    })
    targetCalories: number;

    @ApiProperty({
        description: 'Duration in days',
        example: 7,
    })
    duration: number;

    @ApiProperty({
        description: 'Average rating',
        example: 4.3,
    })
    rating: number;

    @ApiProperty({
        description: 'Recommendation score (0-100)',
        example: 88,
    })
    score: number;

    @ApiProperty({
        description: 'Reason for recommendation',
        example: 'Fits your caloric goals and dietary preferences',
    })
    reason: string;

    @ApiProperty({
        description: 'Diet type',
        example: 'keto',
    })
    dietType: string;

    @ApiProperty({
        description: 'Meal plan tags',
        example: ['keto', 'weight-loss', 'balanced'],
    })
    tags: string[];
}

export class RecommendationResponseDto {
    @ApiProperty({
        description: 'Type of recommendations',
        enum: ['foods', 'recipes', 'meal-plans'],
        example: 'foods',
    })
    type: string;

    @ApiProperty({
        description: 'Food recommendations',
        type: [FoodRecommendationDto],
        required: false,
    })
    foods?: FoodRecommendationDto[];

    @ApiProperty({
        description: 'Recipe recommendations',
        type: [RecipeRecommendationDto],
        required: false,
    })
    recipes?: RecipeRecommendationDto[];

    @ApiProperty({
        description: 'Meal plan recommendations',
        type: [MealPlanRecommendationDto],
        required: false,
    })
    mealPlans?: MealPlanRecommendationDto[];

    @ApiProperty({
        description: 'Total number of recommendations',
        example: 10,
    })
    total: number;

    @ApiProperty({
        description: 'Personalization score (0-100)',
        example: 75,
    })
    personalizationScore: number;

    @ApiProperty({
        description: 'Timestamp of recommendation generation',
        example: '2024-01-27T10:30:00.000Z',
    })
    generatedAt: Date;
} 