import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FoodDocument = Food & Document;

/**
 * Nutritional information per 100g of food
 */
@Schema({ _id: false })
export class Nutrition {
    @Prop({ required: true, min: 0 })
    calories: number; // kcal per 100g

    @Prop({ required: true, min: 0 })
    protein: number; // grams per 100g

    @Prop({ required: true, min: 0 })
    carbohydrates: number; // grams per 100g

    @Prop({ required: true, min: 0 })
    fat: number; // grams per 100g

    @Prop({ required: false, min: 0 })
    fiber?: number; // grams per 100g

    @Prop({ required: false, min: 0 })
    sugar?: number; // grams per 100g

    @Prop({ required: false, min: 0 })
    sodium?: number; // mg per 100g

    @Prop({ required: false, min: 0 })
    potassium?: number; // mg per 100g

    @Prop({ required: false, min: 0 })
    calcium?: number; // mg per 100g

    @Prop({ required: false, min: 0 })
    iron?: number; // mg per 100g

    @Prop({ required: false, min: 0 })
    vitaminC?: number; // mg per 100g

    @Prop({ required: false, min: 0 })
    vitaminA?: number; // mcg per 100g
}

const NutritionSchema = SchemaFactory.createForClass(Nutrition);

@Schema({
    timestamps: true,
    collection: 'foods',
})
export class Food {
    @Prop({
        required: true,
        trim: true,
        maxlength: 100,
        index: true,
    })
    name: string;

    @Prop({
        required: false,
        trim: true,
        maxlength: 100,
    })
    nameEn?: string; // English name for internationalization

    @Prop({
        required: false,
        trim: true,
        maxlength: 500,
    })
    description?: string;

    @Prop({
        required: true,
        enum: [
            'grains',
            'vegetables',
            'fruits',
            'meat',
            'poultry',
            'seafood',
            'dairy',
            'nuts',
            'legumes',
            'beverages',
            'snacks',
            'condiments',
            'oils',
            'other'
        ],
        index: true,
    })
    category: string;

    @Prop({
        required: false,
        type: [String],
        index: true,
    })
    subcategories?: string[]; // More specific categorization

    @Prop({
        required: true,
        type: NutritionSchema,
    })
    nutrition: Nutrition;

    @Prop({
        required: false,
        type: [String],
    })
    commonUnits?: string[]; // Common serving units like 'cup', 'piece', 'slice', etc.

    @Prop({
        required: false,
        type: [String],
    })
    allergens?: string[]; // Common allergens: 'gluten', 'dairy', 'nuts', etc.

    @Prop({
        required: false,
        type: [String],
    })
    dietaryTags?: string[]; // 'vegetarian', 'vegan', 'keto', 'paleo', etc.

    @Prop({
        required: false,
        trim: true,
    })
    barcode?: string; // For packaged foods

    @Prop({
        required: false,
        trim: true,
    })
    brand?: string; // Brand name for packaged foods

    @Prop({
        required: false,
        trim: true,
    })
    imageUrl?: string;

    @Prop({
        default: true,
        index: true,
    })
    isActive: boolean;

    @Prop({
        default: false,
    })
    isVerified: boolean; // Whether nutrition data has been verified

    @Prop({
        required: false,
        enum: ['usda', 'manual', 'api_import', 'user_contributed'],
        default: 'manual',
    })
    dataSource?: string;

    @Prop({
        required: false,
        trim: true,
    })
    sourceReference?: string; // Reference to original data source

    @Prop({
        default: Date.now,
    })
    createdAt: Date;

    @Prop({
        default: Date.now,
    })
    updatedAt: Date;
}

export const FoodSchema = SchemaFactory.createForClass(Food);

// Indexes for efficient querying
FoodSchema.index({ name: 'text', nameEn: 'text', description: 'text' });
FoodSchema.index({ category: 1, subcategories: 1 });
FoodSchema.index({ allergens: 1 });
FoodSchema.index({ dietaryTags: 1 });
FoodSchema.index({ barcode: 1 }, { sparse: true });
FoodSchema.index({ brand: 1 }, { sparse: true });
FoodSchema.index({ isActive: 1, isVerified: 1 });
FoodSchema.index({ createdAt: 1 });

// Virtual for display name (prioritize Chinese name, fallback to English)
FoodSchema.virtual('displayName').get(function (this: FoodDocument) {
    return this.name || this.nameEn || 'Unknown Food';
});

// Ensure virtual fields are serialized
FoodSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    },
}); 