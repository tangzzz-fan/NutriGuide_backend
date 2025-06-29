import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsEnum,
    IsNumber,
    IsDateString,
    IsOptional,
    IsArray,
    IsMongoId,
    IsObject,
    ValidateNested,
    Min,
    Max,
    MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PlannedMealDto {
    @ApiProperty({
        description: 'ID of the food item',
        example: '507f1f77bcf86cd799439011',
    })
    @IsNotEmpty()
    @IsMongoId()
    foodId: string;

    @ApiProperty({
        description: 'Name of the food item',
        example: 'Grilled Chicken Breast',
    })
    @IsNotEmpty()
    @IsString()
    foodName: string;

    @ApiProperty({
        description: 'Planned quantity',
        example: 150,
        minimum: 0.1,
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0.1)
    quantity: number;

    @ApiProperty({
        description: 'Unit of measurement',
        example: 'grams',
        default: 'grams',
    })
    @IsOptional()
    @IsString()
    unit?: string = 'grams';

    @ApiProperty({
        description: 'Weight in grams for nutrition calculation',
        example: 150,
        minimum: 0.1,
    })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    weight?: number;

    @ApiProperty({
        description: 'Notes for this meal item',
        example: 'Seasoned with herbs',
        maxLength: 200,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    notes?: string;
}

export class DayMealPlanDto {
    @ApiProperty({
        description: 'Breakfast meals',
        type: [PlannedMealDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlannedMealDto)
    breakfast: PlannedMealDto[];

    @ApiProperty({
        description: 'Lunch meals',
        type: [PlannedMealDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlannedMealDto)
    lunch: PlannedMealDto[];

    @ApiProperty({
        description: 'Dinner meals',
        type: [PlannedMealDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlannedMealDto)
    dinner: PlannedMealDto[];

    @ApiProperty({
        description: 'Snack meals',
        type: [PlannedMealDto],
    })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => PlannedMealDto)
    snack: PlannedMealDto[];
}

export class CreateMealPlanDto {
    @ApiProperty({
        description: 'Name of the meal plan',
        example: 'Week 1 Healthy Plan',
        maxLength: 100,
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    name: string;

    @ApiProperty({
        description: 'Description of the meal plan',
        example: 'A balanced meal plan focusing on lean proteins and vegetables',
        maxLength: 500,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
        description: 'Type of meal plan',
        enum: ['daily', 'weekly', 'custom'],
        example: 'weekly',
    })
    @IsNotEmpty()
    @IsEnum(['daily', 'weekly', 'custom'])
    type: string;

    @ApiProperty({
        description: 'Start date of the plan',
        example: '2024-01-27',
    })
    @IsNotEmpty()
    @IsDateString()
    startDate: string;

    @ApiProperty({
        description: 'End date of the plan',
        example: '2024-02-02',
    })
    @IsNotEmpty()
    @IsDateString()
    endDate: string;

    @ApiProperty({
        description: 'Meals organized by date (YYYY-MM-DD)',
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
    @IsNotEmpty()
    @IsObject()
    meals: Record<string, DayMealPlanDto>;

    @ApiProperty({
        description: 'Custom tags for the plan',
        example: ['healthy', 'low-carb'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];

    @ApiProperty({
        description: 'Primary goal of the meal plan',
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'],
        example: 'weight_loss',
        required: false,
    })
    @IsOptional()
    @IsEnum(['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'])
    goal?: string;

    @ApiProperty({
        description: 'Daily target calories',
        example: 2000,
        minimum: 1000,
        maximum: 5000,
        required: false,
    })
    @IsOptional()
    @IsNumber()
    @Min(1000)
    @Max(5000)
    targetCalories?: number;

    @ApiProperty({
        description: 'Status of the meal plan',
        enum: ['draft', 'active', 'completed', 'archived'],
        example: 'active',
        default: 'draft',
        required: false,
    })
    @IsOptional()
    @IsEnum(['draft', 'active', 'completed', 'archived'])
    status?: string = 'draft';

    @ApiProperty({
        description: 'Whether this plan can be used as a template',
        example: false,
        default: false,
        required: false,
    })
    @IsOptional()
    isTemplate?: boolean = false;
} 