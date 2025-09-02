import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsArray, ValidateNested, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateShoppingListItemDto {
    @ApiProperty({ description: 'Food item ID', example: '507f1f77bcf86cd799439011', required: false })
    @IsOptional()
    @IsString()
    foodId?: string;

    @ApiProperty({ description: 'Food item name', example: '西兰花', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ description: 'Total quantity needed', example: 500, required: false })
    @IsOptional()
    @IsNumber()
    totalQuantity?: number;

    @ApiProperty({ description: 'Unit of measurement', example: 'g', required: false })
    @IsOptional()
    @IsString()
    unit?: string;

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

export class UpdateShoppingListDto {
    @ApiProperty({ description: 'Shopping list items', type: [UpdateShoppingListItemDto], required: false })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => UpdateShoppingListItemDto)
    items?: UpdateShoppingListItemDto[];

    @ApiProperty({
        description: 'Shopping list status',
        enum: ['pending', 'shopping', 'completed'],
        example: 'shopping',
        required: false
    })
    @IsOptional()
    @IsEnum(['pending', 'shopping', 'completed'])
    status?: string;

    @ApiProperty({ description: 'Additional notes for the shopping list', required: false })
    @IsOptional()
    @IsString()
    notes?: string;
}