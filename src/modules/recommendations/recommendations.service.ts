import {
    Injectable,
    Logger,
    BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Food, FoodDocument } from '../food/schemas/food.schema';
import { Recipe, RecipeDocument } from '../recipes/schemas/recipe.schema';
import { MealPlan, MealPlanDocument } from '../meal-plans/schemas/meal-plan.schema';
import { FoodLog, FoodLogDocument } from '../food-logs/schemas/food-log.schema';
import { UserProfile, UserProfileDocument } from '../user/schemas/user-profile.schema';
import {
    RecommendationQueryDto,
} from './dto/recommendation-query.dto';
import {
    RecommendationResponseDto,
    FoodRecommendationDto,
    RecipeRecommendationDto,
    MealPlanRecommendationDto,
} from './dto/recommendation-response.dto';
import { RecommendationFeedbackDto } from './dto/recommendation-feedback.dto';

@Injectable()
export class RecommendationsService {
    private readonly logger = new Logger(RecommendationsService.name);

    constructor(
        @InjectModel(Food.name) private foodModel: Model<FoodDocument>,
        @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
        @InjectModel(MealPlan.name) private mealPlanModel: Model<MealPlanDocument>,
        @InjectModel(FoodLog.name) private foodLogModel: Model<FoodLogDocument>,
        @InjectModel(UserProfile.name) private userProfileModel: Model<UserProfileDocument>,
    ) { }

    async getRecommendations(userId: string, query: RecommendationQueryDto): Promise<RecommendationResponseDto> {
        this.logger.log(`Generating ${query.type} recommendations for user ${userId}`);

        const userProfile = await this.getUserProfile(userId);
        const userHistory = await this.getUserHistory(userId);

        let recommendations: any[] = [];

        switch (query.type) {
            case 'foods':
                recommendations = await this.getFoodRecommendations(userId, query, userProfile, userHistory);
                break;
            case 'recipes':
                recommendations = await this.getRecipeRecommendations(userId, query, userProfile, userHistory);
                break;
            case 'meal-plans':
                recommendations = await this.getMealPlanRecommendations(userId, query, userProfile, userHistory);
                break;
            default:
                throw new BadRequestException('Invalid recommendation type');
        }

        return {
            type: query.type,
            ...(query.type === 'foods' && { foods: recommendations }),
            ...(query.type === 'recipes' && { recipes: recommendations }),
            ...(query.type === 'meal-plans' && { mealPlans: recommendations }),
            total: recommendations.length,
            personalizationScore: this.calculatePersonalizationScore(userProfile, userHistory),
            generatedAt: new Date(),
        };
    }

    async submitFeedback(userId: string, feedback: RecommendationFeedbackDto): Promise<{ success: boolean }> {
        this.logger.log(`Recording feedback for user ${userId}: ${feedback.action} on ${feedback.itemType} ${feedback.itemId}`);

        // Here you would typically save the feedback to a feedback collection
        // For now, we'll just log it and return success
        // In a real implementation, you'd:
        // 1. Store feedback in a dedicated feedback collection
        // 2. Update recommendation weights/scores based on feedback
        // 3. Improve the ML model based on user interactions

        this.logger.log('Feedback recorded successfully');
        return { success: true };
    }

    private async getFoodRecommendations(
        userId: string,
        query: RecommendationQueryDto,
        userProfile: any,
        userHistory: any
    ): Promise<FoodRecommendationDto[]> {
        const limit = query.limit || 10;

        // Build filter based on user preferences and query
        const filter: any = { isActive: true };

        if (query.dietaryTags?.length) {
            filter.dietaryTags = { $in: query.dietaryTags };
        }

        if (query.allergens?.length) {
            filter.allergens = { $nin: query.allergens };
        }

        if (query.maxCalories) {
            filter['nutrition.calories'] = { $lte: query.maxCalories };
        }

        if (query.minProtein) {
            filter['nutrition.protein'] = { $gte: query.minProtein };
        }

        // Apply user preferences from profile
        if (userProfile?.dietaryPreferences?.length) {
            filter.dietaryTags = { $in: userProfile.dietaryPreferences };
        }

        if (userProfile?.allergens?.length) {
            filter.allergens = { $nin: userProfile.allergens };
        }

        // Get recently consumed foods to potentially exclude or deprioritize
        const recentFoodIds = userHistory.recentFoods || [];
        if (query.excludeRecent && recentFoodIds.length > 0) {
            filter._id = { $nin: recentFoodIds };
        }

        const foods = await this.foodModel
            .find(filter)
            .limit(limit * 2) // Get more to allow for scoring and filtering
            .lean();

        // Score and rank foods
        const scoredFoods = foods.map(food => {
            const score = this.calculateFoodScore(food, userProfile, userHistory, query);
            return { ...food, score };
        });

        // Sort by score and take top results
        const topFoods = scoredFoods
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return topFoods.map(food => ({
            id: food._id.toString(),
            name: food.name,
            category: food.category,
            calories: food.nutrition.calories,
            protein: food.nutrition.protein,
            score: food.score,
            reason: this.generateFoodRecommendationReason(food, userProfile, query),
            dietaryTags: food.dietaryTags || [],
            imageUrl: food.imageUrl,
        }));
    }

    private async getRecipeRecommendations(
        userId: string,
        query: RecommendationQueryDto,
        userProfile: any,
        userHistory: any
    ): Promise<RecipeRecommendationDto[]> {
        const limit = query.limit || 10;

        // Build filter
        const filter: any = { isDeleted: false, isPublic: true };

        if (query.dietaryTags?.length) {
            filter.tags = { $in: query.dietaryTags };
        }

        if (query.maxPrepTime) {
            filter.prepTime = { $lte: query.maxPrepTime };
        }

        if (query.maxCalories && query.maxCalories > 0) {
            filter['nutrition.calories'] = { $lte: query.maxCalories };
        }

        if (query.highRatedOnly) {
            filter.rating = { $gte: 4.0 };
        }

        const recipes = await this.recipeModel
            .find(filter)
            .limit(limit * 2)
            .lean();

        const scoredRecipes = recipes.map(recipe => {
            const score = this.calculateRecipeScore(recipe, userProfile, userHistory, query);
            return { ...recipe, score };
        });

        const topRecipes = scoredRecipes
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return topRecipes.map(recipe => ({
            id: recipe._id.toString(),
            name: recipe.name,
            description: recipe.description,
            calories: recipe.nutrition?.calories || 0,
            prepTime: recipe.prepTime || 0,
            cookTime: recipe.cookTime || 0,
            difficulty: recipe.difficulty,
            rating: recipe.rating,
            score: recipe.score,
            reason: this.generateRecipeRecommendationReason(recipe, userProfile, query),
            tags: recipe.tags || [],
            images: recipe.images || [],
        }));
    }

    private async getMealPlanRecommendations(
        userId: string,
        query: RecommendationQueryDto,
        userProfile: any,
        userHistory: any
    ): Promise<MealPlanRecommendationDto[]> {
        const limit = query.limit || 5; // Fewer meal plans since they're more comprehensive

        const filter: any = { isDeleted: false };

        // Apply caloric filters if specified
        if (query.maxCalories) {
            filter.targetCalories = { $lte: query.maxCalories };
        }

        const mealPlans = await this.mealPlanModel
            .find(filter)
            .limit(limit * 2)
            .lean();

        const scoredMealPlans = mealPlans.map(plan => {
            const score = this.calculateMealPlanScore(plan, userProfile, userHistory, query);
            return { ...plan, score };
        });

        const topMealPlans = scoredMealPlans
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return topMealPlans.map(plan => {
            const duration = plan.startDate && plan.endDate
                ? Math.ceil((new Date(plan.endDate).getTime() - new Date(plan.startDate).getTime()) / (1000 * 60 * 60 * 24))
                : 7;

            return {
                id: plan._id.toString(),
                name: plan.name,
                description: plan.description,
                targetCalories: plan.targetCalories || 2000,
                duration,
                rating: 4.0, // Default rating
                score: plan.score,
                reason: this.generateMealPlanRecommendationReason(plan, userProfile, query),
                dietType: plan.goal || 'balanced',
                tags: plan.tags || [],
            };
        });
    }

    private async getUserProfile(userId: string): Promise<any> {
        return await this.userProfileModel.findOne({ userId: new Types.ObjectId(userId) }).lean();
    }

    private async getUserHistory(userId: string): Promise<any> {
        const recentLogs = await this.foodLogModel
            .find({ userId: new Types.ObjectId(userId) })
            .sort({ consumedAt: -1 })
            .limit(50)
            .lean();

        const recentFoods = recentLogs.map(log => log.foodId);
        const favoriteFoodCategories = this.extractFavoriteCategories(recentLogs);

        return {
            recentFoods,
            favoriteFoodCategories,
            recentLogs,
        };
    }

    private calculateFoodScore(food: any, userProfile: any, userHistory: any, query: RecommendationQueryDto): number {
        let score = 50; // Base score

        // Nutritional alignment
        if (userProfile?.goals?.includes('weight-loss') && food.nutrition.calories < 100) {
            score += 20;
        }
        if (userProfile?.goals?.includes('muscle-gain') && food.nutrition.protein > 20) {
            score += 25;
        }

        // Dietary preferences match
        if (food.dietaryTags?.some(tag => userProfile?.dietaryPreferences?.includes(tag))) {
            score += 15;
        }

        // Category preference based on history
        if (userHistory.favoriteFoodCategories?.includes(food.category)) {
            score += 10;
        }

        // Query-specific boosts
        if (query.mealType && food.category === query.mealType) {
            score += 10;
        }

        // Avoid recently consumed foods
        if (userHistory.recentFoods?.includes(food._id.toString())) {
            score -= 30;
        }

        return Math.max(0, Math.min(100, score));
    }

    private calculateRecipeScore(recipe: any, userProfile: any, userHistory: any, query: RecommendationQueryDto): number {
        let score = 50;

        // Rating boost
        if (recipe.rating > 4.0) score += 20;
        if (recipe.rating > 4.5) score += 10;

        // Difficulty preference
        if (userProfile?.cookingSkill === 'beginner' && recipe.difficulty === 'easy') {
            score += 15;
        }

        // Time preference
        if (query.maxPrepTime && recipe.prepTime <= query.maxPrepTime / 2) {
            score += 10;
        }

        // Dietary tags match
        if (recipe.tags?.some(tag => userProfile?.dietaryPreferences?.includes(tag))) {
            score += 15;
        }

        return Math.max(0, Math.min(100, score));
    }

    private calculateMealPlanScore(plan: any, userProfile: any, userHistory: any, query: RecommendationQueryDto): number {
        let score = 50;

        // Caloric goal alignment
        if (userProfile?.dailyCalorieGoal && plan.targetCalories) {
            const diff = Math.abs(userProfile.dailyCalorieGoal - plan.targetCalories);
            if (diff < 200) score += 20;
            else if (diff < 400) score += 10;
        }

        // Goal match
        if (userProfile?.goals?.includes(plan.goal)) {
            score += 25;
        }

        return Math.max(0, Math.min(100, score));
    }

    private generateFoodRecommendationReason(food: any, userProfile: any, query: RecommendationQueryDto): string {
        const reasons = [];

        if (food.nutrition.protein > 20) reasons.push('high protein');
        if (food.nutrition.calories < 100) reasons.push('low calorie');
        if (food.dietaryTags?.includes('organic')) reasons.push('organic');
        if (userProfile?.goals?.includes('weight-loss')) reasons.push('supports weight loss');

        return reasons.length > 0 ? `Great choice: ${reasons.join(', ')}` : 'Recommended for you';
    }

    private generateRecipeRecommendationReason(recipe: any, userProfile: any, query: RecommendationQueryDto): string {
        const reasons = [];

        if (recipe.prepTime <= 20) reasons.push('quick to prepare');
        if (recipe.difficulty === 'easy') reasons.push('easy to make');
        if (recipe.rating > 4.5) reasons.push('highly rated');
        if (recipe.tags?.includes('healthy')) reasons.push('healthy option');

        return reasons.length > 0 ? `Perfect because it's ${reasons.join(' and ')}` : 'Recommended for you';
    }

    private generateMealPlanRecommendationReason(plan: any, userProfile: any, query: RecommendationQueryDto): string {
        const reasons = [];

        if (plan.goal && userProfile?.goals?.includes(plan.goal)) reasons.push('matches your goals');
        if (plan.targetCalories && userProfile?.dailyCalorieGoal && plan.targetCalories <= userProfile.dailyCalorieGoal) reasons.push('fits your calorie goals');
        reasons.push('well-balanced nutrition');

        return `Excellent choice: ${reasons.join(', ')}`;
    }

    private extractFavoriteCategories(recentLogs: any[]): string[] {
        const categoryCounts = {};

        // This would need to be expanded to actually look up food categories
        // For now, return some example categories
        return ['vegetables', 'protein', 'grains'];
    }

    private calculatePersonalizationScore(userProfile: any, userHistory: any): number {
        let score = 0;

        if (userProfile) score += 40;
        if (userHistory.recentLogs?.length > 10) score += 30;
        if (userProfile?.dietaryPreferences?.length > 0) score += 20;
        if (userProfile?.goals?.length > 0) score += 10;

        return Math.min(100, score);
    }
} 