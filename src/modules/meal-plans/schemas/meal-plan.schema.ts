import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MealPlanDocument = MealPlan & Document;

/**
 * Individual meal within a meal plan
 */
@Schema({ _id: false })
export class PlannedMeal {
    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        ref: 'Food',
    })
    foodId: MongooseSchema.Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
    })
    foodName: string; // Store food name for quick reference

    @Prop({
        required: true,
        min: 0.1,
    })
    quantity: number; // Planned quantity

    @Prop({
        required: true,
        trim: true,
        default: 'grams',
    })
    unit: string; // Unit of measurement

    @Prop({
        required: true,
        min: 0.1,
    })
    weight: number; // Weight in grams for nutrition calculation

    @Prop({
        required: false,
        trim: true,
        maxlength: 200,
    })
    notes?: string; // Notes for this specific meal item
}

const PlannedMealSchema = SchemaFactory.createForClass(PlannedMeal);

/**
 * Meals for a specific day and meal type
 */
@Schema({ _id: false })
export class DayMealPlan {
    @Prop({
        required: true,
        type: [PlannedMealSchema],
    })
    breakfast: PlannedMeal[];

    @Prop({
        required: true,
        type: [PlannedMealSchema],
    })
    lunch: PlannedMeal[];

    @Prop({
        required: true,
        type: [PlannedMealSchema],
    })
    dinner: PlannedMeal[];

    @Prop({
        required: true,
        type: [PlannedMealSchema],
    })
    snack: PlannedMeal[];
}

const DayMealPlanSchema = SchemaFactory.createForClass(DayMealPlan);

@Schema({
    timestamps: true,
    collection: 'meal_plans',
})
export class MealPlan {
    @Prop({
        required: true,
        type: MongooseSchema.Types.ObjectId,
        ref: 'User',
        index: true,
    })
    userId: MongooseSchema.Types.ObjectId;

    @Prop({
        required: true,
        trim: true,
        maxlength: 100,
    })
    name: string; // Plan name (e.g., "Week 1 Healthy Plan")

    @Prop({
        required: false,
        trim: true,
        maxlength: 500,
    })
    description?: string; // Plan description

    @Prop({
        required: true,
        enum: ['daily', 'weekly', 'custom'],
        index: true,
    })
    type: string; // Plan type

    @Prop({
        required: true,
        type: Date,
        index: true,
    })
    startDate: Date; // When the plan starts

    @Prop({
        required: true,
        type: Date,
        index: true,
    })
    endDate: Date; // When the plan ends

    @Prop({
        required: true,
        type: Map,
        of: DayMealPlanSchema,
    })
    meals: Map<string, DayMealPlan>; // Key: date string (YYYY-MM-DD), Value: day meal plan

    @Prop({
        required: false,
        type: [String],
    })
    tags?: string[]; // Custom tags for the plan

    @Prop({
        required: false,
        enum: ['weight_loss', 'weight_gain', 'maintenance', 'muscle_gain', 'heart_healthy', 'diabetic_friendly'],
    })
    goal?: string; // Primary goal of the meal plan

    @Prop({
        required: false,
        min: 1000,
        max: 5000,
    })
    targetCalories?: number; // Daily target calories

    @Prop({
        default: 'draft',
        enum: ['draft', 'active', 'completed', 'archived'],
        index: true,
    })
    status: string;

    @Prop({
        default: false,
    })
    isTemplate: boolean; // Whether this plan can be used as a template

    @Prop({
        required: false,
        trim: true,
        enum: ['manual', 'ai_generated', 'template_based'],
        default: 'manual',
    })
    createdBy?: string; // How the plan was created

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

export const MealPlanSchema = SchemaFactory.createForClass(MealPlan);

// Indexes for efficient querying
MealPlanSchema.index({ userId: 1, startDate: 1, endDate: 1 });
MealPlanSchema.index({ userId: 1, status: 1 });
MealPlanSchema.index({ userId: 1, type: 1 });
MealPlanSchema.index({ isTemplate: 1, goal: 1 }); // For template searches
MealPlanSchema.index({ isActive: 1 }); 