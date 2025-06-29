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
    Min,
    MaxLength,
} from 'class-validator';

export class CreateFoodLogDto {
    @ApiProperty({
        description: 'ID of the food item',
        example: '507f1f77bcf86cd799439011',
    })
    @IsNotEmpty()
    @IsMongoId()
    foodId: string;

    @ApiProperty({
        description: 'Date and time when the food was consumed',
        example: '2024-01-27T12:30:00.000Z',
    })
    @IsNotEmpty()
    @IsDateString()
    consumedAt: string;

    @ApiProperty({
        description: 'Type of meal',
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        example: 'lunch',
    })
    @IsNotEmpty()
    @IsEnum(['breakfast', 'lunch', 'dinner', 'snack'])
    mealType: string;

    @ApiProperty({
        description: 'Quantity of food consumed',
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
        description: 'Weight in grams (for nutrition calculation)',
        example: 150,
        minimum: 0.1,
    })
    @IsOptional()
    @IsNumber()
    @Min(0.1)
    weight?: number;

    @ApiProperty({
        description: 'Optional notes about the meal',
        example: 'Had this for lunch at the office',
        maxLength: 500,
        required: false,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    notes?: string;

    @ApiProperty({
        description: 'Custom tags for the food log',
        example: ['office', 'healthy'],
        required: false,
        type: [String],
    })
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    tags?: string[];
} 