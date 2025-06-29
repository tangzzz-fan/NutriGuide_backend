import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { Food, FoodSchema } from '../food/schemas/food.schema';
import { Recipe, RecipeSchema } from '../recipes/schemas/recipe.schema';
import { MealPlan, MealPlanSchema } from '../meal-plans/schemas/meal-plan.schema';
import { FoodLog, FoodLogSchema } from '../food-logs/schemas/food-log.schema';
import { UserProfile, UserProfileSchema } from '../user/schemas/user-profile.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Food.name, schema: FoodSchema },
            { name: Recipe.name, schema: RecipeSchema },
            { name: MealPlan.name, schema: MealPlanSchema },
            { name: FoodLog.name, schema: FoodLogSchema },
            { name: UserProfile.name, schema: UserProfileSchema },
        ]),
    ],
    controllers: [RecommendationsController],
    providers: [RecommendationsService],
    exports: [RecommendationsService], // Export service for use in other modules
})
export class RecommendationsModule { } 