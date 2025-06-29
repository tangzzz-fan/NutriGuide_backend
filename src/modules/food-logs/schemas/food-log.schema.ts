import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FoodLogDocument = FoodLog & Document;

/**
 * Nutrition data for the consumed amount
 */
@Schema({ _id: false })
export class ConsumedNutrition {
    @Prop({ required: true, min: 0 })
    calories: number; // kcal for consumed amount

    @Prop({ required: true, min: 0 })
    protein: number; // grams for consumed amount

    @Prop({ required: true, min: 0 })
    carbohydrates: number; // grams for consumed amount

    @Prop({ required: true, min: 0 })
    fat: number; // grams for consumed amount

    @Prop({ required: false, min: 0 })
    fiber?: number; // grams for consumed amount

    @Prop({ required: false, min: 0 })
    sugar?: number; // grams for consumed amount

    @Prop({ required: false, min: 0 })
    sodium?: number; // mg for consumed amount

    @Prop({ required: false, min: 0 })
    potassium?: number; // mg for consumed amount

    @Prop({ required: false, min: 0 })
    calcium?: number; // mg for consumed amount

    @Prop({ required: false, min: 0 })
    iron?: number; // mg for consumed amount

    @Prop({ required: false, min: 0 })
    vitaminC?: number; // mg for consumed amount

    @Prop({ required: false, min: 0 })
    vitaminA?: number; // mcg for consumed amount
}

const ConsumedNutritionSchema = SchemaFactory.createForClass(ConsumedNutrition);

@Schema({
    timestamps: true,
    collection: 'food_logs',
})
export class FoodLog {
    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        index: true,
    })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        ref: 'Food',
        index: true,
    })
    foodId: MongooseSchema.Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
    })
    foodName: string; // Store food name for quick reference

    @Prop({
        required: true,
        type: Date,
        index: true,
    })
    consumedAt: Date;

    @Prop({
        required: true,
        enum: ['breakfast', 'lunch', 'dinner', 'snack'],
        index: true,
    })
    mealType: string;

    @Prop({
        required: true,
        min: 0.1,
    })
    quantity: number; // Amount consumed

    @Prop({
        required: true,
        trim: true,
        default: 'grams',
    })
    unit: string; // Unit of measurement (grams, pieces, cups, etc.)

    @Prop({
        required: true,
        min: 0.1,
    })
    weight: number; // Weight in grams (for nutrition calculation)

    @Prop({
        required: true,
        type: ConsumedNutritionSchema,
    })
    nutrition: ConsumedNutrition;

    @Prop({
        required: false,
        trim: true,
        maxlength: 500,
    })
    notes?: string; // User notes about the meal

    @Prop({
        required: false,
        type: [String],
    })
    tags?: string[]; // Custom tags

    @Prop({
        default: true,
    })
    isActive: boolean;

    @Prop({
        default: Date.now,
    })
    createdAt: Date;

    @Prop({
        default: Date.now,
    })
    updatedAt: Date;
}

export const FoodLogSchema = SchemaFactory.createForClass(FoodLog);

// Indexes for efficient querying
FoodLogSchema.index({ userId: 1, consumedAt: 1 });
FoodLogSchema.index({ userId: 1, mealType: 1, consumedAt: 1 });
FoodLogSchema.index({ userId: 1, consumedAt: -1 }); // For recent logs
FoodLogSchema.index({ foodId: 1, consumedAt: 1 }); // For food popularity analysis
FoodLogSchema.index({ isActive: 1 }); 