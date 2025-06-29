import {
    Injectable,
    NotFoundException,
    ForbiddenException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Recipe, RecipeDocument } from './schemas/recipe.schema';
import { Food, FoodDocument } from '../food/schemas/food.schema';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { RecipeQueryDto } from './dto/recipe-query.dto';
import {
    RecipeResponseDto,
    RecipeListResponseDto,
} from './dto/recipe-response.dto';

@Injectable()
export class RecipesService {
    private readonly logger = new Logger(RecipesService.name);

    constructor(
        @InjectModel(Recipe.name) private recipeModel: Model<RecipeDocument>,
        @InjectModel(Food.name) private foodModel: Model<FoodDocument>,
    ) { }

    async create(userId: string, createRecipeDto: CreateRecipeDto): Promise<RecipeResponseDto> {
        this.logger.log(`Creating recipe for user ${userId}: ${createRecipeDto.name}`);

        // Validate that all food IDs exist
        const foodIds = createRecipeDto.ingredients.map(ingredient => ingredient.foodId);
        const foods = await this.foodModel.find({ _id: { $in: foodIds } });

        if (foods.length !== foodIds.length) {
            const foundIds = foods.map(food => food._id.toString());
            const missingIds = foodIds.filter(id => !foundIds.includes(id));
            throw new BadRequestException(`Food items not found: ${missingIds.join(', ')}`);
        }

        // Calculate total nutrition if not provided
        let nutrition = createRecipeDto.nutrition;
        if (!nutrition && createRecipeDto.ingredients.length > 0) {
            nutrition = await this.calculateNutrition(createRecipeDto.ingredients, createRecipeDto.servings);
        }

        const recipe = new this.recipeModel({
            ...createRecipeDto,
            createdBy: new Types.ObjectId(userId),
            nutrition,
            views: 0,
            favorites: [],
            rating: 0,
            ratingCount: 0,
            isDeleted: false,
        });

        const savedRecipe = await recipe.save();
        return this.toResponseDto(savedRecipe, userId);
    }

    async findAll(userId: string, query: RecipeQueryDto): Promise<RecipeListResponseDto> {
        const {
            search,
            categories,
            tags,
            difficulty,
            minPrepTime,
            maxPrepTime,
            minCookTime,
            maxCookTime,
            minServings,
            maxServings,
            userId: filterUserId,
            isPublic,
            favoritesOnly,
            sortBy = 'createdAt',
            sortOrder = 'desc',
            page = 1,
            limit = 10,
        } = query;

        // Build filter query
        const filter: any = { isDeleted: false };

        if (search) {
            filter.$text = { $search: search };
        }

        if (categories && categories.length > 0) {
            filter.categories = { $in: categories };
        }

        if (tags && tags.length > 0) {
            filter.tags = { $in: tags };
        }

        if (difficulty) {
            filter.difficulty = difficulty;
        }

        if (minPrepTime || maxPrepTime) {
            filter.prepTime = {};
            if (minPrepTime) filter.prepTime.$gte = minPrepTime;
            if (maxPrepTime) filter.prepTime.$lte = maxPrepTime;
        }

        if (minCookTime || maxCookTime) {
            filter.cookTime = {};
            if (minCookTime) filter.cookTime.$gte = minCookTime;
            if (maxCookTime) filter.cookTime.$lte = maxCookTime;
        }

        if (minServings || maxServings) {
            filter.servings = {};
            if (minServings) filter.servings.$gte = minServings;
            if (maxServings) filter.servings.$lte = maxServings;
        }

        if (filterUserId) {
            filter.createdBy = new Types.ObjectId(filterUserId);
        }

        if (isPublic !== undefined) {
            filter.isPublic = isPublic;
        } else {
            // If not filtering by isPublic, show public recipes + user's own recipes
            filter.$or = [
                { isPublic: true },
                { createdBy: new Types.ObjectId(userId) }
            ];
        }

        if (favoritesOnly) {
            filter.favorites = new Types.ObjectId(userId);
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute queries
        const skip = (page - 1) * limit;
        const [recipes, total] = await Promise.all([
            this.recipeModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('ingredients.foodId', 'name nutrition')
                .lean(),
            this.recipeModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        return {
            recipes: recipes.map(recipe => this.toResponseDto(recipe, userId)),
            total,
            page,
            limit,
            totalPages,
            hasNextPage,
            hasPreviousPage,
        };
    }

    async findOne(userId: string, id: string): Promise<RecipeResponseDto> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe ID format');
        }

        const recipe = await this.recipeModel
            .findOne({
                _id: new Types.ObjectId(id),
                isDeleted: false,
            })
            .populate('ingredients.foodId', 'name nutrition')
            .lean();

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        // Check if user can access this recipe
        if (!recipe.isPublic && recipe.createdBy.toString() !== userId) {
            throw new ForbiddenException('Access denied to this recipe');
        }

        // Increment view count
        await this.recipeModel.updateOne(
            { _id: new Types.ObjectId(id) },
            { $inc: { views: 1 } }
        );

        return this.toResponseDto({ ...recipe, views: recipe.views + 1 }, userId);
    }

    async update(userId: string, id: string, updateRecipeDto: UpdateRecipeDto): Promise<RecipeResponseDto> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe ID format');
        }

        const recipe = await this.recipeModel.findOne({
            _id: new Types.ObjectId(id),
            isDeleted: false,
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        if (recipe.createdBy.toString() !== userId) {
            throw new ForbiddenException('You can only update your own recipes');
        }

        // Validate food IDs if ingredients are being updated
        if (updateRecipeDto.ingredients) {
            const foodIds = updateRecipeDto.ingredients.map(ingredient => ingredient.foodId);
            const foods = await this.foodModel.find({ _id: { $in: foodIds } });

            if (foods.length !== foodIds.length) {
                const foundIds = foods.map(food => food._id.toString());
                const missingIds = foodIds.filter(id => !foundIds.includes(id));
                throw new BadRequestException(`Food items not found: ${missingIds.join(', ')}`);
            }
        }

        // Recalculate nutrition if ingredients or servings changed
        let nutrition = updateRecipeDto.nutrition;
        if (!nutrition && (updateRecipeDto.ingredients || updateRecipeDto.servings)) {
            const ingredients = updateRecipeDto.ingredients || recipe.ingredients;
            const servings = updateRecipeDto.servings || recipe.servings;
            nutrition = await this.calculateNutrition(ingredients, servings);
        }

        const updatedRecipe = await this.recipeModel
            .findByIdAndUpdate(
                id,
                { ...updateRecipeDto, nutrition },
                { new: true }
            )
            .populate('ingredients.foodId', 'name nutrition')
            .lean();

        return this.toResponseDto(updatedRecipe, userId);
    }

    async remove(userId: string, id: string): Promise<RecipeResponseDto> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid recipe ID format');
        }

        const recipe = await this.recipeModel.findOne({
            _id: new Types.ObjectId(id),
            isDeleted: false,
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        if (recipe.createdBy.toString() !== userId) {
            throw new ForbiddenException('You can only delete your own recipes');
        }

        const deletedRecipe = await this.recipeModel
            .findByIdAndUpdate(
                id,
                { isDeleted: true, deletedAt: new Date() },
                { new: true }
            )
            .populate('ingredients.foodId', 'name nutrition')
            .lean();

        return this.toResponseDto(deletedRecipe, userId);
    }

    async toggleFavorite(userId: string, recipeId: string): Promise<{ isFavorited: boolean }> {
        if (!Types.ObjectId.isValid(recipeId)) {
            throw new BadRequestException('Invalid recipe ID format');
        }

        const recipe = await this.recipeModel.findOne({
            _id: new Types.ObjectId(recipeId),
            isDeleted: false,
        });

        if (!recipe) {
            throw new NotFoundException('Recipe not found');
        }

        const userObjectId = new Types.ObjectId(userId);
        const isFavorited = recipe.favorites.some(fav => fav.toString() === userId);

        if (isFavorited) {
            // Remove from favorites
            await this.recipeModel.updateOne(
                { _id: new Types.ObjectId(recipeId) },
                { $pull: { favorites: userObjectId } }
            );
        } else {
            // Add to favorites
            await this.recipeModel.updateOne(
                { _id: new Types.ObjectId(recipeId) },
                { $push: { favorites: userObjectId } }
            );
        }

        return { isFavorited: !isFavorited };
    }

    async getFavorites(userId: string, query: RecipeQueryDto): Promise<RecipeListResponseDto> {
        return this.findAll(userId, { ...query, favoritesOnly: true });
    }

    async searchRecipes(userId: string, searchTerm: string, query: RecipeQueryDto): Promise<RecipeListResponseDto> {
        return this.findAll(userId, { ...query, search: searchTerm });
    }

    private async calculateNutrition(ingredients: any[], servings: number): Promise<any> {
        let totalNutrition = {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0,
        };

        for (const ingredient of ingredients) {
            const food = await this.foodModel.findById(ingredient.foodId);
            if (food && food.nutrition) {
                const ratio = ingredient.quantity / 100; // Assuming nutrition facts are per 100g
                totalNutrition.calories += (food.nutrition.calories || 0) * ratio;
                totalNutrition.protein += (food.nutrition.protein || 0) * ratio;
                totalNutrition.carbohydrates += (food.nutrition.carbohydrates || 0) * ratio;
                totalNutrition.fat += (food.nutrition.fat || 0) * ratio;
                totalNutrition.fiber += (food.nutrition.fiber || 0) * ratio;
                totalNutrition.sugar += (food.nutrition.sugar || 0) * ratio;
                totalNutrition.sodium += (food.nutrition.sodium || 0) * ratio;
            }
        }

        // Divide by servings to get per-serving nutrition
        Object.keys(totalNutrition).forEach(key => {
            totalNutrition[key] = Math.round((totalNutrition[key] / servings) * 100) / 100;
        });

        return totalNutrition;
    }

    private toResponseDto(recipe: any, userId: string): RecipeResponseDto {
        const isFavorited = recipe.favorites?.some((fav: any) => fav.toString() === userId) || false;
        const favoritesCount = recipe.favorites?.length || 0;
        const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);

        return {
            id: recipe._id.toString(),
            name: recipe.name,
            description: recipe.description,
            createdBy: recipe.createdBy.toString(),
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            nutrition: recipe.nutrition,
            prepTime: recipe.prepTime,
            cookTime: recipe.cookTime,
            totalTime: totalTime > 0 ? totalTime : undefined,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            categories: recipe.categories,
            tags: recipe.tags,
            images: recipe.images,
            views: recipe.views,
            favoritesCount,
            isFavorited,
            rating: recipe.rating,
            ratingCount: recipe.ratingCount,
            isPublic: recipe.isPublic,
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt,
        };
    }
} 