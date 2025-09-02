import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateShoppingListItemDto {
    @ApiProperty({ description: 'Food item ID', example: '507f1f77bcf86cd799439011' })
    @IsNotEmpty()
    @IsString()
    foodId: string;

    @ApiProperty({ description: 'Food item name', example: '西兰花' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Total quantity needed', example: 500 })
    @IsNotEmpty()
    @IsNumber()
    totalQuantity: number;

    @ApiProperty({ description: 'Unit of measurement', example: 'g' })
    @IsNotEmpty()
    @IsString()
    unit: string;

    @ApiProperty({ description: 'Whether item has been purchased', example: false, required: false })
    @IsOptional()
    @IsBoolean()
    isPurchased?: boolean;

    @ApiProperty({ description: 'Estimated price', example: 12.5, required: false })
    @IsOptional()
    @IsNumber()
    estimatedPrice?: number;

    @ApiProperty({ description: 'Notes for this item', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}

export class CreateShoppingListDto {
    @ApiProperty({ description: 'Meal plan ID this list is based on', example: '507f1f77bcf86cd799439012' })
    @IsNotEmpty()
    @IsString()
    planId: string;

    @ApiProperty({ description: 'Shopping list items', type: [CreateShoppingListItemDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateShoppingListItemDto)
    items: CreateShoppingListItemDto[];

    @ApiProperty({ description: 'Additional notes for the shopping list', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}