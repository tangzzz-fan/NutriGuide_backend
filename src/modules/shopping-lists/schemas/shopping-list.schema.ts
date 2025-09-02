import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ShoppingListDocument = ShoppingList & Document;

@Schema()
export class ShoppingListItem {
    @ApiProperty({ description: 'Food item ID', example: '507f1f77bcf86cd799439011' })
    @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
    foodId: Types.ObjectId;

    @ApiProperty({ description: 'Food item name', example: '西兰花' })
    @Prop({ required: true })
    name: string;

    @ApiProperty({ description: 'Total quantity needed', example: 500 })
    @Prop({ required: true })
    totalQuantity: number;

    @ApiProperty({ description: 'Unit of measurement', example: 'g' })
    @Prop({ required: true })
    unit: string;

    @ApiProperty({ description: 'Whether item has been purchased', example: false })
    @Prop({ default: false })
    isPurchased: boolean;

    @ApiProperty({ description: 'Estimated price', example: 12.5, required: false })
    @Prop()
    estimatedPrice?: number;

    @ApiProperty({ description: 'Notes for this item', required: false })
    @Prop()
    notes?: string;
}

@Schema({ timestamps: true })
export class ShoppingList {
    @ApiProperty({ description: 'Shopping list ID' })
    _id: Types.ObjectId;

    @ApiProperty({ description: 'User who owns this shopping list' })
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @ApiProperty({ description: 'Meal plan ID this list is based on' })
    @Prop({ type: Types.ObjectId, ref: 'MealPlan', required: true })
    planId: Types.ObjectId;

    @ApiProperty({ description: 'Shopping list items', type: [ShoppingListItem] })
    @Prop({ type: [ShoppingListItem] })
    items: ShoppingListItem[];

    @ApiProperty({ description: 'Total estimated cost', example: 150.25 })
    @Prop()
    totalEstimatedCost?: number;

    @ApiProperty({ description: 'Shopping list status', enum: ['pending', 'shopping', 'completed'], example: 'pending' })
    @Prop({
        enum: ['pending', 'shopping', 'completed'],
        default: 'pending'
    })
    status: string;

    @ApiProperty({ description: 'Additional notes for the shopping list' })
    @Prop()
    notes?: string;

    @ApiProperty({ description: 'Creation timestamp' })
    createdAt: Date;

    @ApiProperty({ description: 'Last update timestamp' })
    updatedAt: Date;
}

export const ShoppingListSchema = SchemaFactory.createForClass(ShoppingList);

// Index for efficient queries
ShoppingListSchema.index({ userId: 1, planId: 1 });
ShoppingListSchema.index({ userId: 1, status: 1 });
ShoppingListSchema.index({ userId: 1, createdAt: -1 });