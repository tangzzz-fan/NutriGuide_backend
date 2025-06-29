import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { Food, FoodSchema } from '../food/schemas/food.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Recipe.name, schema: RecipeSchema },
            { name: Food.name, schema: FoodSchema },
        ]),
    ],
    controllers: [RecipesController],
    providers: [RecipesService],
    exports: [RecipesService], // Export service for use in other modules
})
export class RecipesModule { } 