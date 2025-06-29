import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NutritionController } from './nutrition.controller';
import { NutritionService } from './nutrition.service';
import { FoodLog, FoodLogSchema } from '../food-logs/schemas/food-log.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FoodLog.name, schema: FoodLogSchema }, // Import FoodLog for nutrition calculations
        ]),
    ],
    controllers: [NutritionController],
    providers: [NutritionService],
    exports: [NutritionService], // Export service for potential use in other modules
})
export class NutritionModule { } 