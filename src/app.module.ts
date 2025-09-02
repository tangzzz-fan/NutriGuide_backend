import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import environmentConfig from './config/environment.config';
import databaseConfig from './config/database.config';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { FoodModule } from './modules/food/food.module';
import { FoodLogsModule } from './modules/food-logs/food-logs.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { MealPlansModule } from './modules/meal-plans/meal-plans.module';
import { RecipesModule } from './modules/recipes/recipes.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { ShoppingListsModule } from './modules/shopping-lists/shopping-lists.module';
import { EcommerceModule } from './modules/ecommerce/ecommerce.module';

@Module({
    imports: [
        // Configuration module with environment-specific configs
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: [`.env.${process.env.NODE_ENV || 'development'}`, '.env'],
            load: [environmentConfig, databaseConfig],
            cache: true,
        }),

        // MongoDB connection with environment-specific configuration
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const dbConfig = configService.get('database');
                return {
                    uri: dbConfig.uri,
                    ...dbConfig,
                };
            },
            inject: [ConfigService],
        }),

        // Feature modules
        UserModule,
        AuthModule,
        FoodModule,
        FoodLogsModule,
        NutritionModule,
        MealPlansModule,
        RecipesModule,
        RecommendationsModule,
        ShoppingListsModule,
        EcommerceModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: AllExceptionsFilter,
        },
    ],
})
export class AppModule { }
