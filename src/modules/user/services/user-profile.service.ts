import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProfile, UserProfileDocument } from '../schemas/user-profile.schema';
import { CreateUserProfileDto, UpdateUserProfileDto } from '../dto/user-profile.dto';

@Injectable()
export class UserProfileService {
    private readonly logger = new Logger(UserProfileService.name);

    constructor(
        @InjectModel(UserProfile.name)
        private readonly userProfileModel: Model<UserProfileDocument>,
    ) { }

    /**
     * Create a new user profile (onboarding)
     */
    async createProfile(
        userId: string,
        createProfileDto: CreateUserProfileDto,
    ): Promise<UserProfileDocument> {
        this.logger.log(`Creating profile for user: ${userId}`);

        // Check if profile already exists
        const existingProfile = await this.userProfileModel.findOne({ userId: new Types.ObjectId(userId) });
        if (existingProfile) {
            throw new ConflictException('User profile already exists');
        }

        try {
            const profileData = {
                ...createProfileDto,
                userId: new Types.ObjectId(userId),
            };

            const createdProfile = new this.userProfileModel(profileData);
            const savedProfile = await createdProfile.save();

            this.logger.log(`Profile created successfully for user: ${userId}`);
            return savedProfile;
        } catch (error) {
            this.logger.error(`Failed to create profile for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get user profile by user ID
     */
    async getProfileByUserId(userId: string): Promise<UserProfileDocument> {
        this.logger.log(`Getting profile for user: ${userId}`);

        const profile = await this.userProfileModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .exec();

        if (!profile) {
            throw new NotFoundException('User profile not found');
        }

        return profile;
    }

    /**
     * Update user profile
     */
    async updateProfile(
        userId: string,
        updateProfileDto: UpdateUserProfileDto,
    ): Promise<UserProfileDocument> {
        this.logger.log(`Updating profile for user: ${userId}`);

        const updatedProfile = await this.userProfileModel
            .findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    ...updateProfileDto,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            )
            .exec();

        if (!updatedProfile) {
            throw new NotFoundException('User profile not found');
        }

        this.logger.log(`Profile updated successfully for user: ${userId}`);
        return updatedProfile;
    }

    /**
     * Delete user profile
     */
    async deleteProfile(userId: string): Promise<void> {
        this.logger.log(`Deleting profile for user: ${userId}`);

        const result = await this.userProfileModel
            .deleteOne({ userId: new Types.ObjectId(userId) })
            .exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('User profile not found');
        }

        this.logger.log(`Profile deleted successfully for user: ${userId}`);
    }

    /**
     * Check if user has completed profile setup
     */
    async hasProfile(userId: string): Promise<boolean> {
        const profile = await this.userProfileModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .select('_id')
            .exec();

        return !!profile;
    }

    /**
     * Get profiles by health goal (for analytics/admin)
     */
    async getProfilesByGoal(goal: string): Promise<UserProfileDocument[]> {
        return this.userProfileModel
            .find({ mainGoal: goal })
            .exec();
    }

    /**
     * Get profiles by activity level (for analytics/admin)
     */
    async getProfilesByActivityLevel(activityLevel: string): Promise<UserProfileDocument[]> {
        return this.userProfileModel
            .find({ activityLevel })
            .exec();
    }

    /**
     * Calculate BMR (Basal Metabolic Rate) using Harris-Benedict equation
     */
    calculateBMR(profile: UserProfileDocument): number {
        const { gender, age, weight, height } = profile;

        let bmr: number;
        if (gender === 'male') {
            bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
        } else if (gender === 'female') {
            bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
        } else {
            // For 'other', use average of male and female formulas
            const maleBMR = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
            const femaleBMR = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
            bmr = (maleBMR + femaleBMR) / 2;
        }

        return Math.round(bmr);
    }

    /**
     * Calculate TDEE (Total Daily Energy Expenditure)
     */
    calculateTDEE(profile: UserProfileDocument): number {
        const bmr = this.calculateBMR(profile);

        const activityMultipliers = {
            sedentary: 1.2,
            lightly_active: 1.375,
            moderately_active: 1.55,
            very_active: 1.725,
            extremely_active: 1.9,
        };

        const multiplier = activityMultipliers[profile.activityLevel] || 1.2;
        return Math.round(bmr * multiplier);
    }

    /**
     * Get daily calorie recommendation based on goal
     */
    getDailyCalorieRecommendation(profile: UserProfileDocument): number {
        const tdee = this.calculateTDEE(profile);

        switch (profile.mainGoal) {
            case 'weight_loss':
                return Math.round(tdee * 0.8); // 20% deficit
            case 'weight_gain':
                return Math.round(tdee * 1.2); // 20% surplus
            case 'muscle_gain':
                return Math.round(tdee * 1.15); // 15% surplus
            case 'weight_maintain':
            case 'improve_health':
            case 'manage_condition':
            default:
                return tdee;
        }
    }

    /**
     * Get macronutrient recommendations (in grams)
     */
    getMacronutrientRecommendations(profile: UserProfileDocument): {
        protein: number;
        carbohydrates: number;
        fat: number;
    } {
        const calories = this.getDailyCalorieRecommendation(profile);
        const { weight, mainGoal } = profile;

        let proteinRatio: number;
        let fatRatio: number;
        let carbRatio: number;

        switch (mainGoal) {
            case 'weight_loss':
                proteinRatio = 0.30; // 30% protein
                fatRatio = 0.25;     // 25% fat
                carbRatio = 0.45;    // 45% carbs
                break;
            case 'muscle_gain':
                proteinRatio = 0.25; // 25% protein
                fatRatio = 0.25;     // 25% fat
                carbRatio = 0.50;    // 50% carbs
                break;
            case 'weight_gain':
                proteinRatio = 0.20; // 20% protein
                fatRatio = 0.30;     // 30% fat
                carbRatio = 0.50;    // 50% carbs
                break;
            default:
                proteinRatio = 0.20; // 20% protein
                fatRatio = 0.25;     // 25% fat
                carbRatio = 0.55;    // 55% carbs
        }

        return {
            protein: Math.round((calories * proteinRatio) / 4), // 4 cal per gram
            carbohydrates: Math.round((calories * carbRatio) / 4), // 4 cal per gram
            fat: Math.round((calories * fatRatio) / 9), // 9 cal per gram
        };
    }
} 