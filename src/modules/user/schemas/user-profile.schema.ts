import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProfileDocument = UserProfile & Document & {
    bmi: number;
    bmiCategory: string;
};

/**
 * Health conditions enumeration
 */
export enum HealthCondition {
    DIABETES = 'diabetes',
    HYPERTENSION = 'hypertension',
    HIGH_CHOLESTEROL = 'high_cholesterol',
    HEART_DISEASE = 'heart_disease',
    KIDNEY_DISEASE = 'kidney_disease',
    LIVER_DISEASE = 'liver_disease',
    THYROID_DISORDER = 'thyroid_disorder',
    DIGESTIVE_ISSUES = 'digestive_issues',
    NONE = 'none'
}

/**
 * Activity level enumeration
 */
export enum ActivityLevel {
    SEDENTARY = 'sedentary',           // 久坐，很少运动
    LIGHTLY_ACTIVE = 'lightly_active', // 轻度活跃，每周运动1-3次
    MODERATELY_ACTIVE = 'moderately_active', // 中度活跃，每周运动3-5次
    VERY_ACTIVE = 'very_active',       // 高度活跃，每周运动6-7次
    EXTREMELY_ACTIVE = 'extremely_active' // 极度活跃，每天运动或体力劳动
}

/**
 * Health goals enumeration
 */
export enum HealthGoal {
    WEIGHT_LOSS = 'weight_loss',
    WEIGHT_GAIN = 'weight_gain',
    WEIGHT_MAINTAIN = 'weight_maintain',
    MUSCLE_GAIN = 'muscle_gain',
    IMPROVE_HEALTH = 'improve_health',
    MANAGE_CONDITION = 'manage_condition'
}

@Schema({
    timestamps: true,
    collection: 'user_profiles',
})
export class UserProfile {
    @Prop({
        required: true,
        type: Types.ObjectId,
        ref: 'User',
        unique: true,
    })
    userId: Types.ObjectId;

    @Prop({
        required: true,
        enum: ['male', 'female', 'other'],
    })
    gender: string;

    @Prop({
        required: true,
        min: 10,
        max: 120,
    })
    age: number;

    @Prop({
        required: true,
        min: 100,
        max: 250,
    })
    height: number; // cm

    @Prop({
        required: true,
        min: 30,
        max: 300,
    })
    weight: number; // kg

    @Prop({
        required: true,
        enum: Object.values(ActivityLevel),
    })
    activityLevel: ActivityLevel;

    @Prop({
        required: false,
        type: Object,
    })
    sleepSchedule?: {
        bedtime: string; // HH:mm format
        wakeTime: string; // HH:mm format
        averageHours: number;
    };

    @Prop({
        required: false,
        type: [String],
        enum: Object.values(HealthCondition),
        default: [HealthCondition.NONE],
    })
    healthConditions: HealthCondition[];

    @Prop({
        required: false,
        type: [String],
        default: [],
    })
    allergies: string[];

    @Prop({
        required: true,
        enum: Object.values(HealthGoal),
    })
    mainGoal: HealthGoal;

    @Prop({
        required: false,
        min: 30,
        max: 300,
    })
    targetWeight?: number; // kg

    @Prop({
        required: false,
        min: 1,
        max: 52,
    })
    goalTimeline?: number; // weeks

    @Prop({
        default: Date.now,
    })
    createdAt: Date;

    @Prop({
        default: Date.now,
    })
    updatedAt: Date;
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);

// Indexes
UserProfileSchema.index({ userId: 1 }, { unique: true });
UserProfileSchema.index({ mainGoal: 1 });
UserProfileSchema.index({ activityLevel: 1 });
UserProfileSchema.index({ createdAt: 1 });

// Virtual for BMI calculation
UserProfileSchema.virtual('bmi').get(function (this: UserProfileDocument) {
    const heightInMeters = this.height / 100;
    return parseFloat((this.weight / (heightInMeters * heightInMeters)).toFixed(2));
});

// Virtual for BMI category
UserProfileSchema.virtual('bmiCategory').get(function (this: UserProfileDocument) {
    const bmi = this.bmi;
    if (bmi < 18.5) return 'underweight';
    if (bmi < 25) return 'normal';
    if (bmi < 30) return 'overweight';
    return 'obese';
});

// Ensure virtual fields are serialized
UserProfileSchema.set('toJSON', {
    virtuals: true,
    transform: function (doc, ret) {
        delete ret.__v;
        return ret;
    },
}); 