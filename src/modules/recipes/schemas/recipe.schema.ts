import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ collection: 'recipes' })
export class Ingredient {
    @Prop({ type: Types.ObjectId, ref: 'Food', required: true })
    foodId: Types.ObjectId;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true, min: 0 })
    quantity: number;

    @Prop({ required: true })
    unit: string;

    @Prop({ default: false })
    optional: boolean;

    @Prop()
    notes?: string;
}

@Schema({ collection: 'recipes' })
export class Step {
    @Prop({ required: true, min: 1 })
    order: number;

    @Prop({ required: true })
    instruction: string;

    @Prop()
    duration?: number; // in minutes

    @Prop()
    temperature?: number; // in celsius

    @Prop([String])
    images?: string[];
}

@Schema({ collection: 'recipes' })
export class NutritionInfo {
    @Prop({ required: true, min: 0 })
    calories: number;

    @Prop({ required: true, min: 0 })
    protein: number; // in grams

    @Prop({ required: true, min: 0 })
    carbohydrates: number; // in grams

    @Prop({ required: true, min: 0 })
    fat: number; // in grams

    @Prop({ min: 0 })
    fiber?: number; // in grams

    @Prop({ min: 0 })
    sugar?: number; // in grams

    @Prop({ min: 0 })
    sodium?: number; // in mg

    @Prop({ min: 0 })
    cholesterol?: number; // in mg
}

@Schema({ timestamps: true })
export class Recipe {
    @Prop({ required: true, trim: true })
    name: string;

    @Prop({ trim: true })
    description?: string;

    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    createdBy: Types.ObjectId;

    @Prop([{ type: Ingredient }])
    ingredients: Ingredient[];

    @Prop([{ type: Step }])
    steps: Step[];

    @Prop({ type: NutritionInfo })
    nutrition?: NutritionInfo;

    @Prop({ min: 0 })
    prepTime?: number; // in minutes

    @Prop({ min: 0 })
    cookTime?: number; // in minutes

    @Prop({ min: 1 })
    servings: number;

    @Prop({
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    })
    difficulty: string;

    @Prop([String])
    categories: string[];

    @Prop([String])
    tags: string[];

    @Prop([String])
    images: string[];

    @Prop({ default: 0, min: 0 })
    views: number;

    @Prop([{ type: Types.ObjectId, ref: 'User' }])
    favorites: Types.ObjectId[];

    @Prop({ default: 0, min: 0 })
    rating: number;

    @Prop({ default: 0, min: 0 })
    ratingCount: number;

    @Prop({ default: true })
    isPublic: boolean;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop()
    deletedAt?: Date;

    createdAt: Date;
    updatedAt: Date;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);

// Add indexes for better query performance
RecipeSchema.index({ name: 'text', description: 'text' });
RecipeSchema.index({ createdBy: 1 });
RecipeSchema.index({ categories: 1 });
RecipeSchema.index({ tags: 1 });
RecipeSchema.index({ rating: -1 });
RecipeSchema.index({ createdAt: -1 });
RecipeSchema.index({ isDeleted: 1 }); 