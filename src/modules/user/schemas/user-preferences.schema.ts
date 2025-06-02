import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserPreferencesDocument = UserPreferences & Document;

/**
 * Taste preferences enumeration
 */
export enum TastePreference {
    SWEET = 'sweet',
    SOUR = 'sour',
    BITTER = 'bitter',
    SPICY = 'spicy',
    SALTY = 'salty',
    UMAMI = 'umami',
    MILD = 'mild',
    RICH = 'rich'
}

/**
 * Regional cuisine preferences
 */
export enum RegionalCuisine {
    CHINESE_NORTHERN = 'chinese_northern',
    CHINESE_SOUTHERN = 'chinese_southern',
    SICHUAN = 'sichuan',
    CANTONESE = 'cantonese',
    HUNAN = 'hunan',
    SHANDONG = 'shandong',
    JIANGSU = 'jiangsu',
    WESTERN = 'western',
    JAPANESE = 'japanese',
    KOREAN = 'korean',
    THAI = 'thai',
    MEDITERRANEAN = 'mediterranean'
}

/**
 * Dietary restrictions enumeration
 */
export enum DietaryRestriction {
    VEGETARIAN = 'vegetarian',
    VEGAN = 'vegan',
    PESCATARIAN = 'pescatarian',
    HALAL = 'halal',
    KOSHER = 'kosher',
    GLUTEN_FREE = 'gluten_free',
    DAIRY_FREE = 'dairy_free',
    LOW_CARB = 'low_carb',
    KETO = 'keto',
    PALEO = 'paleo',
    NO_PORK = 'no_pork',
    NO_BEEF = 'no_beef',
    NO_SEAFOOD = 'no_seafood'
}

/**
 * Cooking skill level enumeration
 */
export enum CookingSkill {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

/**
 * Budget level enumeration
 */
export enum BudgetLevel {
    LOW = 'low',           // <20 CNY per meal
    MEDIUM = 'medium',     // 20-50 CNY per meal
    HIGH = 'high',         // 50-100 CNY per meal
    PREMIUM = 'premium'    // >100 CNY per meal
}

@Schema({
    timestamps: true,
    collection: 'user_preferences',
})
export class UserPreferences {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'User',
        unique: true,
    })
    userId: Types.ObjectId;

    @Prop({
        required: false,
        type: Types.ObjectId,
        ref: 'DietaryGuideline',
    })
    selectedDietaryGuidelineId?: Types.ObjectId;

    @Prop({
        required: false,
        type: [String],
        enum: Object.values(TastePreference),
        default: [],
    })
    tastePreferences: TastePreference[];

    @Prop({
        required: false,
        type: [String],
        enum: Object.values(RegionalCuisine),
        default: [],
    })
    regionalHabits: RegionalCuisine[];

    @Prop({
        required: false,
        type: [String],
        enum: Object.values(DietaryRestriction),
        default: [],
    })
    dietaryRestrictions: DietaryRestriction[];

    @Prop({
        required: false,
        min: 10,
        max: 180,
        default: 30,
    })
    cookingTimePreference: number; // minutes

    @Prop({
        required: false,
        enum: Object.values(CookingSkill),
        default: CookingSkill.BEGINNER,
    })
    cookingSkill: CookingSkill;

    @Prop({
        required: false,
        enum: Object.values(BudgetLevel),
        default: BudgetLevel.MEDIUM,
    })
    budgetPerMeal: BudgetLevel;

    @Prop({
        required: false,
        type: [String],
        default: [],
    })
    dislikedIngredients: string[];

    @Prop({
        required: false,
        type: [String],
        default: [],
    })
    favoriteIngredients: string[];

    @Prop({
        required: false,
        type: Object,
    })
    mealTiming?: {
        breakfast: string; // HH:mm format
        lunch: string;     // HH:mm format
        dinner: string;    // HH:mm format
        snacks?: string[]; // Array of HH:mm format
    };

    @Prop({
        required: false,
        type: Object,
    })
    nutritionFocus?: {
        prioritizeProtein: boolean;
        limitSodium: boolean;
        increaseFiber: boolean;
        limitSugar: boolean;
        focusOnVitamins: string[]; // e.g., ['vitamin_c', 'vitamin_d', 'iron']
    };

    @Prop({
        default: Date.now,
    })
    createdAt: Date;

    @Prop({
        default: Date.now,
    })
    updatedAt: Date;
}

export const UserPreferencesSchema = SchemaFactory.createForClass(UserPreferences);

// Indexes
UserPreferencesSchema.index({ userId: 1 }, { unique: true });
UserPreferencesSchema.index({ selectedDietaryGuidelineId: 1 });
UserPreferencesSchema.index({ tastePreferences: 1 });
UserPreferencesSchema.index({ regionalHabits: 1 });
UserPreferencesSchema.index({ dietaryRestrictions: 1 });
UserPreferencesSchema.index({ createdAt: 1 });

// Ensure virtual fields are serialized
UserPreferencesSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    },
}); 