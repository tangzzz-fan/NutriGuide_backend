import { ApiProperty } from '@nestjs/swagger';
import {
    IsNotEmpty,
    IsString,
    IsOptional,
    IsArray,
    IsNumber,
    IsEnum,
    IsBoolean,
    Min,
    ValidateNested,
    ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateIngredientDto {
    @ApiProperty({
        description: 'Food ID from the food database',
        example: '507f1f77bcf86cd799439011',
    })
    @IsNotEmpty()
    @IsString()
    foodId: string;

    @ApiProperty({
        description: 'Ingredient name',
        example: 'Chicken breast',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Quantity of the ingredient',
        example: 200,
    })
    @IsNumber()
    @Min(0)
    quantity: number;

    @ApiProperty({
        description: 'Unit of measurement',
        example: 'grams',
    })
    @IsNotEmpty()
    @IsString()
    unit: string;

    @ApiProperty({
        description: 'Whether the ingredient is optional',
        example: false,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    optional?: boolean;

    @ApiProperty({
        description: 'Additional notes for the ingredient',
        example: 'Boneless and skinless',
        required: false,
    })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateStepDto {
    @ApiProperty({
        description: 'Step order number',
        example: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;

    @ApiProperty({
        description: 'Step instruction',
        example: 'Heat oil in a pan over medium heat',
    })
    @IsNotEmpty()
    @IsString()
    instruction: string;

    @ApiProperty({
        description: 'Duration in minutes',
        example: 5,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    duration?: number;

    @ApiProperty({
        description: 'Temperature in celsius',
        example: 180,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    temperature?: number;

    @ApiProperty({
        description: 'Step images',
        example: ['step1.jpg', 'step2.jpg'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];
}

export class CreateNutritionInfoDto {
    @ApiProperty({
        description: 'Calories per serving',
        example: 350,
    })
    @IsNumber()
    @Min(0)
    calories: number;

    @ApiProperty({
        description: 'Protein in grams',
        example: 25,
    })
    @IsNumber()
    @Min(0)
    protein: number;

    @ApiProperty({
        description: 'Carbohydrates in grams',
        example: 15,
    })
    @IsNumber()
    @Min(0)
    carbohydrates: number;

    @ApiProperty({
        description: 'Fat in grams',
        example: 20,
    })
    @IsNumber()
    @Min(0)
    fat: number;

    @ApiProperty({
        description: 'Fiber in grams',
        example: 3,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    fiber?: number;

    @ApiProperty({
        description: 'Sugar in grams',
        example: 5,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sugar?: number;

    @ApiProperty({
        description: 'Sodium in mg',
        example: 400,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    sodium?: number;


}

export class CreateRecipeDto {
    @ApiProperty({
        description: 'Recipe name',
        example: 'Grilled Chicken with Vegetables',
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        description: 'Recipe description',
        example: 'A healthy and delicious grilled chicken dish with seasonal vegetables',
        required: false,
    })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({
        description: 'Recipe ingredients',
        type: [CreateIngredientDto],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateIngredientDto)
    ingredients: CreateIngredientDto[];

    @ApiProperty({
        description: 'Recipe steps',
        type: [CreateStepDto],
    })
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => CreateStepDto)
    steps: CreateStepDto[];

    @ApiProperty({
        description: 'Nutrition information',
        type: CreateNutritionInfoDto,
        required: false,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => CreateNutritionInfoDto)
    nutrition?: CreateNutritionInfoDto;

    @ApiProperty({
        description: 'Preparation time in minutes',
        example: 15,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    prepTime?: number;

    @ApiProperty({
        description: 'Cooking time in minutes',
        example: 25,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(0)
    cookTime?: number;

    @ApiProperty({
        description: 'Number of servings',
        example: 4,
    })
    @IsNumber()
    @Min(1)
    servings: number;

    @ApiProperty({
        description: 'Recipe difficulty level',
        enum: ['easy', 'medium', 'hard'],
        example: 'medium',
        required: false,
    })
    @IsOptional()
    @IsEnum(['easy', 'medium', 'hard'])
    difficulty?: string;

    @ApiProperty({
        description: 'Recipe categories',
        example: ['dinner', 'healthy', 'protein'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    categories?: string[];

    @ApiProperty({
        description: 'Recipe tags',
        example: ['low-carb', 'gluten-free', 'high-protein'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({
        description: 'Recipe images',
        example: ['recipe1.jpg', 'recipe2.jpg'],
        required: false,
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    images?: string[];

    @ApiProperty({
        description: 'Whether the recipe is public',
        example: true,
        required: false,
    })
    @IsOptional()
    @IsBoolean()
    isPublic?: boolean;
} 