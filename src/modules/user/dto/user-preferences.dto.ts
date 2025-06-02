import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
    IsString,
    IsNumber,
    IsEnum,
    IsOptional,
    IsArray,
    ValidateNested,
    Min,
    Max,
    Matches,
    IsBoolean,
} from 'class-validator';
import {
    TastePreference,
    RegionalCuisine,
    DietaryRestriction,
    CookingSkill,
    BudgetLevel,
} from '../schemas/user-preferences.schema';

/**
 * Meal timing DTO
 */
export class MealTimingDto {
    @ApiProperty({
        description: 'Breakfast time in HH:mm format',
        example: '08:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Breakfast time must be in HH:mm format',
    })
    breakfast: string;

    @ApiProperty({
        description: 'Lunch time in HH:mm format',
        example: '12:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Lunch time must be in HH:mm format',
    })
    lunch: string;

    @ApiProperty({
        description: 'Dinner time in HH:mm format',
        example: '18:00',
    })
    @IsString()
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        message: 'Dinner time must be in HH:mm format',
    })
    dinner: string;

    @ApiPropertyOptional({
        description: 'Snack times in HH:mm format',
        isArray: true,
        example: ['10:00', '15:00'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
        each: true,
        message: 'Each snack time must be in HH:mm format',
    })
    snacks?: string[];
}

/**
 * Nutrition focus DTO
 */
export class NutritionFocusDto {
    @ApiProperty({
        description: 'Whether to prioritize protein intake',
        example: true,
    })
    @IsBoolean()
    prioritizeProtein: boolean;

    @ApiProperty({
        description: 'Whether to limit sodium intake',
        example: false,
    })
    @IsBoolean()
    limitSodium: boolean;

    @ApiProperty({
        description: 'Whether to increase fiber intake',
        example: true,
    })
    @IsBoolean()
    increaseFiber: boolean;

    @ApiProperty({
        description: 'Whether to limit sugar intake',
        example: true,
    })
    @IsBoolean()
    limitSugar: boolean;

    @ApiPropertyOptional({
        description: 'Vitamins and minerals to focus on',
        isArray: true,
        example: ['vitamin_c', 'vitamin_d', 'iron'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    focusOnVitamins?: string[];
}

/**
 * Create user preferences DTO
 */
export class CreateUserPreferencesDto {
    @ApiPropertyOptional({
        description: 'Selected dietary guideline ID',
        example: '64a7b3c1234567890abcdef0',
    })
    @IsOptional()
    @IsString()
    selectedDietaryGuidelineId?: string;

    @ApiPropertyOptional({
        description: 'User taste preferences',
        enum: TastePreference,
        isArray: true,
        example: [TastePreference.SPICY, TastePreference.UMAMI],
    })
    @IsOptional()
    @IsArray()
    @IsEnum(TastePreference, { each: true })
    tastePreferences?: TastePreference[];

    @ApiPropertyOptional({
        description: 'User regional cuisine preferences',
        enum: RegionalCuisine,
        isArray: true,
        example: [RegionalCuisine.SICHUAN, RegionalCuisine.CANTONESE],
    })
    @IsOptional()
    @IsArray()
    @IsEnum(RegionalCuisine, { each: true })
    regionalHabits?: RegionalCuisine[];

    @ApiPropertyOptional({
        description: 'User dietary restrictions',
        enum: DietaryRestriction,
        isArray: true,
        example: [DietaryRestriction.VEGETARIAN],
    })
    @IsOptional()
    @IsArray()
    @IsEnum(DietaryRestriction, { each: true })
    dietaryRestrictions?: DietaryRestriction[];

    @ApiPropertyOptional({
        description: 'Preferred cooking time in minutes',
        example: 30,
        minimum: 10,
        maximum: 180,
    })
    @IsOptional()
    @IsNumber()
    @Min(10)
    @Max(180)
    cookingTimePreference?: number;

    @ApiPropertyOptional({
        description: 'User cooking skill level',
        enum: CookingSkill,
        example: CookingSkill.INTERMEDIATE,
    })
    @IsOptional()
    @IsEnum(CookingSkill)
    cookingSkill?: CookingSkill;

    @ApiPropertyOptional({
        description: 'Budget level per meal',
        enum: BudgetLevel,
        example: BudgetLevel.MEDIUM,
    })
    @IsOptional()
    @IsEnum(BudgetLevel)
    budgetPerMeal?: BudgetLevel;

    @ApiPropertyOptional({
        description: 'Disliked ingredients',
        isArray: true,
        example: ['香菜', '胡萝卜'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    dislikedIngredients?: string[];

    @ApiPropertyOptional({
        description: 'Favorite ingredients',
        isArray: true,
        example: ['鸡肉', '西兰花'],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    favoriteIngredients?: string[];

    @ApiPropertyOptional({
        description: 'Meal timing preferences',
        type: MealTimingDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => MealTimingDto)
    mealTiming?: MealTimingDto;

    @ApiPropertyOptional({
        description: 'Nutrition focus preferences',
        type: NutritionFocusDto,
    })
    @IsOptional()
    @ValidateNested()
    @Type(() => NutritionFocusDto)
    nutritionFocus?: NutritionFocusDto;
}

/**
 * Update user preferences DTO
 */
export class UpdateUserPreferencesDto extends PartialType(CreateUserPreferencesDto) { }

/**
 * User preferences response DTO
 */
export class UserPreferencesResponseDto {
    @ApiProperty({
        description: 'Preferences ID',
        example: '64a7b3c1234567890abcdef0',
    })
    _id: string;

    @ApiProperty({
        description: 'User ID',
        example: '64a7b3c1234567890abcdef1',
    })
    userId: string;

    @ApiPropertyOptional({
        description: 'Selected dietary guideline ID',
    })
    selectedDietaryGuidelineId?: string;

    @ApiPropertyOptional({
        description: 'User taste preferences',
        enum: TastePreference,
        isArray: true,
    })
    tastePreferences?: TastePreference[];

    @ApiPropertyOptional({
        description: 'User regional cuisine preferences',
        enum: RegionalCuisine,
        isArray: true,
    })
    regionalHabits?: RegionalCuisine[];

    @ApiPropertyOptional({
        description: 'User dietary restrictions',
        enum: DietaryRestriction,
        isArray: true,
    })
    dietaryRestrictions?: DietaryRestriction[];

    @ApiPropertyOptional({
        description: 'Preferred cooking time in minutes',
    })
    cookingTimePreference?: number;

    @ApiPropertyOptional({
        description: 'User cooking skill level',
        enum: CookingSkill,
    })
    cookingSkill?: CookingSkill;

    @ApiPropertyOptional({
        description: 'Budget level per meal',
        enum: BudgetLevel,
    })
    budgetPerMeal?: BudgetLevel;

    @ApiPropertyOptional({
        description: 'Disliked ingredients',
        isArray: true,
    })
    dislikedIngredients?: string[];

    @ApiPropertyOptional({
        description: 'Favorite ingredients',
        isArray: true,
    })
    favoriteIngredients?: string[];

    @ApiPropertyOptional({
        description: 'Meal timing preferences',
        type: MealTimingDto,
    })
    mealTiming?: MealTimingDto;

    @ApiPropertyOptional({
        description: 'Nutrition focus preferences',
        type: NutritionFocusDto,
    })
    nutritionFocus?: NutritionFocusDto;

    @ApiProperty({
        description: 'Creation timestamp',
        example: '2023-07-07T10:30:00.000Z',
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Last update timestamp',
        example: '2023-07-07T10:30:00.000Z',
    })
    updatedAt: Date;
} 