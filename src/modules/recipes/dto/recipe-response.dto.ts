import { ApiProperty } from '@nestjs/swagger';

export class IngredientResponseDto {
    @ApiProperty({
        description: 'Food ID reference',
        example: '507f1f77bcf86cd799439011',
    })
    foodId: string;

    @ApiProperty({
        description: 'Ingredient name',
        example: 'Chicken breast',
    })
    name: string;

    @ApiProperty({
        description: 'Quantity of the ingredient',
        example: 200,
    })
    quantity: number;

    @ApiProperty({
        description: 'Unit of measurement',
        example: 'grams',
    })
    unit: string;

    @ApiProperty({
        description: 'Whether the ingredient is optional',
        example: false,
    })
    optional: boolean;

    @ApiProperty({
        description: 'Additional notes for the ingredient',
        example: 'Boneless and skinless',
        required: false,
    })
    notes?: string;
}

export class StepResponseDto {
    @ApiProperty({
        description: 'Step order number',
        example: 1,
    })
    order: number;

    @ApiProperty({
        description: 'Step instruction',
        example: 'Heat oil in a pan over medium heat',
    })
    instruction: string;

    @ApiProperty({
        description: 'Duration in minutes',
        example: 5,
        required: false,
    })
    duration?: number;

    @ApiProperty({
        description: 'Temperature in celsius',
        example: 180,
        required: false,
    })
    temperature?: number;

    @ApiProperty({
        description: 'Step images',
        example: ['step1.jpg', 'step2.jpg'],
        required: false,
    })
    images?: string[];
}

export class NutritionInfoResponseDto {
    @ApiProperty({
        description: 'Calories per serving',
        example: 350,
    })
    calories: number;

    @ApiProperty({
        description: 'Protein in grams',
        example: 25,
    })
    protein: number;

    @ApiProperty({
        description: 'Carbohydrates in grams',
        example: 15,
    })
    carbohydrates: number;

    @ApiProperty({
        description: 'Fat in grams',
        example: 20,
    })
    fat: number;

    @ApiProperty({
        description: 'Fiber in grams',
        example: 3,
        required: false,
    })
    fiber?: number;

    @ApiProperty({
        description: 'Sugar in grams',
        example: 5,
        required: false,
    })
    sugar?: number;

    @ApiProperty({
        description: 'Sodium in mg',
        example: 400,
        required: false,
    })
    sodium?: number;


}

export class RecipeResponseDto {
    @ApiProperty({
        description: 'Recipe ID',
        example: '507f1f77bcf86cd799439011',
    })
    id: string;

    @ApiProperty({
        description: 'Recipe name',
        example: 'Grilled Chicken with Vegetables',
    })
    name: string;

    @ApiProperty({
        description: 'Recipe description',
        example: 'A healthy and delicious grilled chicken dish with seasonal vegetables',
        required: false,
    })
    description?: string;

    @ApiProperty({
        description: 'User who created the recipe',
        example: '507f1f77bcf86cd799439011',
    })
    createdBy: string;

    @ApiProperty({
        description: 'Recipe ingredients',
        type: [IngredientResponseDto],
    })
    ingredients: IngredientResponseDto[];

    @ApiProperty({
        description: 'Recipe steps',
        type: [StepResponseDto],
    })
    steps: StepResponseDto[];

    @ApiProperty({
        description: 'Nutrition information',
        type: NutritionInfoResponseDto,
        required: false,
    })
    nutrition?: NutritionInfoResponseDto;

    @ApiProperty({
        description: 'Preparation time in minutes',
        example: 15,
        required: false,
    })
    prepTime?: number;

    @ApiProperty({
        description: 'Cooking time in minutes',
        example: 25,
        required: false,
    })
    cookTime?: number;

    @ApiProperty({
        description: 'Total time in minutes',
        example: 40,
        required: false,
    })
    totalTime?: number;

    @ApiProperty({
        description: 'Number of servings',
        example: 4,
    })
    servings: number;

    @ApiProperty({
        description: 'Recipe difficulty level',
        enum: ['easy', 'medium', 'hard'],
        example: 'medium',
    })
    difficulty: string;

    @ApiProperty({
        description: 'Recipe categories',
        example: ['dinner', 'healthy', 'protein'],
    })
    categories: string[];

    @ApiProperty({
        description: 'Recipe tags',
        example: ['low-carb', 'gluten-free', 'high-protein'],
    })
    tags: string[];

    @ApiProperty({
        description: 'Recipe images',
        example: ['recipe1.jpg', 'recipe2.jpg'],
    })
    images: string[];

    @ApiProperty({
        description: 'Number of views',
        example: 245,
    })
    views: number;

    @ApiProperty({
        description: 'Number of users who favorited this recipe',
        example: 15,
    })
    favoritesCount: number;

    @ApiProperty({
        description: 'Whether the current user has favorited this recipe',
        example: true,
    })
    isFavorited: boolean;

    @ApiProperty({
        description: 'Average rating',
        example: 4.5,
    })
    rating: number;

    @ApiProperty({
        description: 'Number of ratings',
        example: 23,
    })
    ratingCount: number;

    @ApiProperty({
        description: 'Whether the recipe is public',
        example: true,
    })
    isPublic: boolean;

    @ApiProperty({
        description: 'Creation date',
        example: '2024-01-27T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update date',
        example: '2024-01-27T10:30:00.000Z',
    })
    updatedAt: Date;
}

export class RecipeListResponseDto {
    @ApiProperty({
        description: 'List of recipes',
        type: [RecipeResponseDto],
    })
    recipes: RecipeResponseDto[];

    @ApiProperty({
        description: 'Total number of recipes',
        example: 150,
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1,
    })
    page: number;

    @ApiProperty({
        description: 'Number of items per page',
        example: 10,
    })
    limit: number;

    @ApiProperty({
        description: 'Total number of pages',
        example: 15,
    })
    totalPages: number;

    @ApiProperty({
        description: 'Whether there are more pages',
        example: true,
    })
    hasNextPage: boolean;

    @ApiProperty({
        description: 'Whether there are previous pages',
        example: false,
    })
    hasPreviousPage: boolean;
} 