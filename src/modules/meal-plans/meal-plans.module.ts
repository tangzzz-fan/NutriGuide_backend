import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MealPlansController } from './meal-plans.controller';
import { MealPlansService } from './meal-plans.service';
import { MealPlan, MealPlanSchema } from './schemas/meal-plan.schema';
import { Food, FoodSchema } from '../food/schemas/food.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: MealPlan.name, schema: MealPlanSchema },
            { name: Food.name, schema: FoodSchema }, // Import Food model for validation and AI generation
        ]),
    ],
    controllers: [MealPlansController],
    providers: [MealPlansService],
    exports: [MealPlansService], // Export service for potential use in other modules
})
export class MealPlansModule { } 