import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserPreferences, UserPreferencesDocument } from '../schemas/user-preferences.schema';
import { CreateUserPreferencesDto, UpdateUserPreferencesDto } from '../dto/user-preferences.dto';

@Injectable()
export class UserPreferencesService {
    private readonly logger = new Logger(UserPreferencesService.name);

    constructor(
        @InjectModel(UserPreferences.name)
        private readonly userPreferencesModel: Model<UserPreferencesDocument>,
    ) { }

    /**
     * Create user preferences
     */
    async createPreferences(
        userId: string,
        createPreferencesDto: CreateUserPreferencesDto,
    ): Promise<UserPreferencesDocument> {
        this.logger.log(`Creating preferences for user: ${userId}`);

        // Check if preferences already exist
        const existingPreferences = await this.userPreferencesModel.findOne({
            userId: new Types.ObjectId(userId)
        });
        if (existingPreferences) {
            throw new ConflictException('User preferences already exist');
        }

        try {
            const preferencesData = {
                ...createPreferencesDto,
                userId: new Types.ObjectId(userId),
                selectedDietaryGuidelineId: createPreferencesDto.selectedDietaryGuidelineId
                    ? new Types.ObjectId(createPreferencesDto.selectedDietaryGuidelineId)
                    : undefined,
            };

            const createdPreferences = new this.userPreferencesModel(preferencesData);
            const savedPreferences = await createdPreferences.save();

            this.logger.log(`Preferences created successfully for user: ${userId}`);
            return savedPreferences;
        } catch (error) {
            this.logger.error(`Failed to create preferences for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get user preferences by user ID
     */
    async getPreferencesByUserId(userId: string): Promise<UserPreferencesDocument> {
        this.logger.log(`Getting preferences for user: ${userId}`);

        const preferences = await this.userPreferencesModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .populate('selectedDietaryGuidelineId')
            .exec();

        if (!preferences) {
            throw new NotFoundException('User preferences not found');
        }

        return preferences;
    }

    /**
     * Update user preferences
     */
    async updatePreferences(
        userId: string,
        updatePreferencesDto: UpdateUserPreferencesDto,
    ): Promise<UserPreferencesDocument> {
        this.logger.log(`Updating preferences for user: ${userId}`);

        const updateData = {
            ...updatePreferencesDto,
            selectedDietaryGuidelineId: updatePreferencesDto.selectedDietaryGuidelineId
                ? new Types.ObjectId(updatePreferencesDto.selectedDietaryGuidelineId)
                : undefined,
            updatedAt: new Date(),
        };

        const updatedPreferences = await this.userPreferencesModel
            .findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                updateData,
                { new: true, runValidators: true }
            )
            .populate('selectedDietaryGuidelineId')
            .exec();

        if (!updatedPreferences) {
            throw new NotFoundException('User preferences not found');
        }

        this.logger.log(`Preferences updated successfully for user: ${userId}`);
        return updatedPreferences;
    }

    /**
     * Delete user preferences
     */
    async deletePreferences(userId: string): Promise<void> {
        this.logger.log(`Deleting preferences for user: ${userId}`);

        const result = await this.userPreferencesModel
            .deleteOne({ userId: new Types.ObjectId(userId) })
            .exec();

        if (result.deletedCount === 0) {
            throw new NotFoundException('User preferences not found');
        }

        this.logger.log(`Preferences deleted successfully for user: ${userId}`);
    }

    /**
     * Check if user has set preferences
     */
    async hasPreferences(userId: string): Promise<boolean> {
        const preferences = await this.userPreferencesModel
            .findOne({ userId: new Types.ObjectId(userId) })
            .select('_id')
            .exec();

        return !!preferences;
    }

    /**
     * Get or create default preferences for user
     */
    async getOrCreateDefaultPreferences(userId: string): Promise<UserPreferencesDocument> {
        try {
            return await this.getPreferencesByUserId(userId);
        } catch (error) {
            if (error instanceof NotFoundException) {
                // Create default preferences
                const defaultPreferences: CreateUserPreferencesDto = {
                    tastePreferences: [],
                    regionalHabits: [],
                    dietaryRestrictions: [],
                    cookingTimePreference: 30,
                    dislikedIngredients: [],
                    favoriteIngredients: [],
                };

                return this.createPreferences(userId, defaultPreferences);
            }
            throw error;
        }
    }

    /**
     * Get users by dietary restrictions (for analytics/targeting)
     */
    async getUsersByDietaryRestrictions(restrictions: string[]): Promise<UserPreferencesDocument[]> {
        return this.userPreferencesModel
            .find({
                dietaryRestrictions: { $in: restrictions }
            })
            .exec();
    }

    /**
     * Get users by taste preferences (for recommendation optimization)
     */
    async getUsersByTastePreferences(tastes: string[]): Promise<UserPreferencesDocument[]> {
        return this.userPreferencesModel
            .find({
                tastePreferences: { $in: tastes }
            })
            .exec();
    }

    /**
     * Get users by regional cuisine preferences
     */
    async getUsersByRegionalPreferences(regions: string[]): Promise<UserPreferencesDocument[]> {
        return this.userPreferencesModel
            .find({
                regionalHabits: { $in: regions }
            })
            .exec();
    }

    /**
     * Get users by cooking skill level
     */
    async getUsersByCookingSkill(skillLevel: string): Promise<UserPreferencesDocument[]> {
        return this.userPreferencesModel
            .find({ cookingSkill: skillLevel })
            .exec();
    }

    /**
     * Get users by budget level
     */
    async getUsersByBudgetLevel(budgetLevel: string): Promise<UserPreferencesDocument[]> {
        return this.userPreferencesModel
            .find({ budgetPerMeal: budgetLevel })
            .exec();
    }

    /**
     * Add ingredient to favorites
     */
    async addFavoriteIngredient(userId: string, ingredient: string): Promise<UserPreferencesDocument> {
        const updatedPreferences = await this.userPreferencesModel
            .findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    $addToSet: { favoriteIngredients: ingredient },
                    $pull: { dislikedIngredients: ingredient }, // Remove from dislikes if present
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            )
            .exec();

        if (!updatedPreferences) {
            throw new NotFoundException('User preferences not found');
        }

        return updatedPreferences;
    }

    /**
     * Add ingredient to dislikes
     */
    async addDislikedIngredient(userId: string, ingredient: string): Promise<UserPreferencesDocument> {
        const updatedPreferences = await this.userPreferencesModel
            .findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    $addToSet: { dislikedIngredients: ingredient },
                    $pull: { favoriteIngredients: ingredient }, // Remove from favorites if present
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            )
            .exec();

        if (!updatedPreferences) {
            throw new NotFoundException('User preferences not found');
        }

        return updatedPreferences;
    }

    /**
     * Remove ingredient from both favorites and dislikes
     */
    async removeIngredientPreference(userId: string, ingredient: string): Promise<UserPreferencesDocument> {
        const updatedPreferences = await this.userPreferencesModel
            .findOneAndUpdate(
                { userId: new Types.ObjectId(userId) },
                {
                    $pull: {
                        favoriteIngredients: ingredient,
                        dislikedIngredients: ingredient
                    },
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            )
            .exec();

        if (!updatedPreferences) {
            throw new NotFoundException('User preferences not found');
        }

        return updatedPreferences;
    }

    /**
     * Update meal timing preferences
     */
    async updateMealTiming(
        userId: string,
        mealTiming: any
    ): Promise<UserPreferencesDocument> {
        return this.updatePreferences(userId, { mealTiming });
    }

    /**
     * Update nutrition focus preferences
     */
    async updateNutritionFocus(
        userId: string,
        nutritionFocus: any
    ): Promise<UserPreferencesDocument> {
        return this.updatePreferences(userId, { nutritionFocus });
    }
} 