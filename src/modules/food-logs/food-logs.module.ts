import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FoodLogsController } from './food-logs.controller';
import { FoodLogsService } from './food-logs.service';
import { FoodLog, FoodLogSchema } from './schemas/food-log.schema';
import { Food, FoodSchema } from '../food/schemas/food.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: FoodLog.name, schema: FoodLogSchema },
            { name: Food.name, schema: FoodSchema }, // Import Food model for nutrition calculation
        ]),
    ],
    controllers: [FoodLogsController],
    providers: [FoodLogsService],
    exports: [FoodLogsService], // Export service for use in nutrition analysis module
})
export class FoodLogsModule { } 