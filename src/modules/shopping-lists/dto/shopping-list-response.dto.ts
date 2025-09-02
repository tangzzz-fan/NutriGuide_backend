import { ApiProperty } from '@nestjs/swagger';

export class ShoppingListItemResponseDto {
    @ApiProperty({ description: 'Food item ID', example: '507f1f77bcf86cd799439011' })
    foodId: string;

    @ApiProperty({ description: 'Food item name', example: '西兰花' })
    name: string;

    @ApiProperty({ description: 'Total quantity needed', example: 500 })
    totalQuantity: number;

    @ApiProperty({ description: 'Unit of measurement', example: 'g' })
    unit: string;

    @ApiProperty({ description: 'Whether item has been purchased', example: false })
    isPurchased: boolean;

    @ApiProperty({ description: 'Estimated price', example: 12.5, required: false })
    estimatedPrice?: number;

    @ApiProperty({ description: 'Notes for this item', required: false })
    notes?: string;
}

export class ShoppingListResponseDto {
    @ApiProperty({ description: 'Shopping list ID', example: '507f1f77bcf86cd799439013' })
    id: string;

    @ApiProperty({ description: 'User ID who owns this shopping list', example: '507f1f77bcf86cd799439010' })
    userId: string;

    @ApiProperty({ description: 'Meal plan ID this list is based on', example: '507f1f77bcf86cd799439012' })
    planId: string;

    @ApiProperty({ description: 'Shopping list items', type: [ShoppingListItemResponseDto] })
    items: ShoppingListItemResponseDto[];

    @ApiProperty({ description: 'Total estimated cost', example: 150.25, required: false })
    totalEstimatedCost?: number;

    @ApiProperty({ description: 'Shopping list status', enum: ['pending', 'shopping', 'completed'], example: 'pending' })
    status: string;

    @ApiProperty({ description: 'Additional notes for the shopping list', required: false })
    notes?: string;

    @ApiProperty({ description: 'Creation timestamp', example: '2025-09-02T10:30:00.000Z' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp', example: '2025-09-02T10:30:00.000Z' })
    updatedAt: Date;
}