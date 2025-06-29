import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MealPlan, MealPlanDocument } from './schemas/meal-plan.schema';
import { Food, FoodDocument } from '../food/schemas/food.schema';
import { CreateMealPlanDto } from './dto/create-meal-plan.dto';
import { UpdateMealPlanDto } from './dto/update-meal-plan.dto';
import { MealPlanQueryDto } from './dto/meal-plan-query.dto';
import { MealPlanListResponseDto, GenerateMealPlanDto } from './dto/meal-plan-response.dto';

@Injectable()
export class MealPlansService {
    private readonly logger = new Logger(MealPlansService.name);

    constructor(
        @InjectModel(MealPlan.name)
        private readonly mealPlanModel: Model<MealPlanDocument>,
        @InjectModel(Food.name)
        private readonly foodModel: Model<FoodDocument>,
    ) { }

    async create(
        userId: string,
        createMealPlanDto: CreateMealPlanDto,
    ): Promise<MealPlanDocument> {
        this.logger.log(`Creating meal plan for user ${userId}: ${createMealPlanDto.name}`);

        // Validate that all foods exist
        await this.validateFoods(createMealPlanDto);

        const mealPlanData = {
            ...createMealPlanDto,
            userId: new Types.ObjectId(userId),
            startDate: new Date(createMealPlanDto.startDate),
            endDate: new Date(createMealPlanDto.endDate),
            meals: new Map(Object.entries(createMealPlanDto.meals)),
        };

        const savedMealPlan = await this.mealPlanModel.create(mealPlanData);

        this.logger.log(`Meal plan created successfully: ${savedMealPlan._id}`);
        return savedMealPlan;
    }

    async findAll(
        userId: string,
        query: MealPlanQueryDto,
    ): Promise<MealPlanListResponseDto> {
        const {
            type,
            status,
            goal,
            name,
            startDateFrom,
            startDateTo,
            isTemplate,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc',
        } = query;

        // Build filter
        const filter: any = {
            userId: new Types.ObjectId(userId),
            isActive: true,
        };

        if (type) filter.type = type;
        if (status) filter.status = status;
        if (goal) filter.goal = goal;
        if (name) filter.name = { $regex: name, $options: 'i' };
        if (isTemplate !== undefined) filter.isTemplate = isTemplate;

        if (startDateFrom || startDateTo) {
            filter.startDate = {};
            if (startDateFrom) filter.startDate.$gte = new Date(startDateFrom);
            if (startDateTo) filter.startDate.$lte = new Date(startDateTo);
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.mealPlanModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .exec(),
            this.mealPlanModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items.map(item => this.transformMealPlan(item)) as any,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findWeeklyPlans(userId: string, date: string): Promise<MealPlanDocument[]> {
        const startDate = new Date(date);
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6); // End of week
        endDate.setHours(23, 59, 59, 999);

        return this.mealPlanModel
            .find({
                userId: new Types.ObjectId(userId),
                $or: [
                    { startDate: { $gte: startDate, $lte: endDate } },
                    { endDate: { $gte: startDate, $lte: endDate } },
                    { startDate: { $lte: startDate }, endDate: { $gte: endDate } },
                ],
                isActive: true,
            })
            .sort({ startDate: 1 })
            .exec();
    }

    async findOne(userId: string, id: string): Promise<MealPlanDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid meal plan ID');
        }

        const mealPlan = await this.mealPlanModel
            .findOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId),
                isActive: true,
            })
            .exec();

        if (!mealPlan) {
            throw new NotFoundException('Meal plan not found');
        }

        return mealPlan;
    }

    async update(
        userId: string,
        id: string,
        updateMealPlanDto: UpdateMealPlanDto,
    ): Promise<MealPlanDocument> {
        await this.findOne(userId, id);

        // Validate foods if meals are being updated
        if (updateMealPlanDto.meals) {
            await this.validateFoods(updateMealPlanDto as CreateMealPlanDto);
        }

        let updatedData: any = { ...updateMealPlanDto };

        if (updateMealPlanDto.startDate) {
            updatedData.startDate = new Date(updateMealPlanDto.startDate);
        }
        if (updateMealPlanDto.endDate) {
            updatedData.endDate = new Date(updateMealPlanDto.endDate);
        }
        if (updateMealPlanDto.meals) {
            updatedData.meals = new Map(Object.entries(updateMealPlanDto.meals));
        }

        const updatedPlan = await this.mealPlanModel
            .findByIdAndUpdate(id, updatedData, { new: true })
            .exec();

        this.logger.log(`Meal plan updated successfully: ${id}`);
        return updatedPlan!;
    }

    async remove(userId: string, id: string): Promise<MealPlanDocument> {
        const mealPlan = await this.findOne(userId, id);

        // Soft delete
        const deletedPlan = await this.mealPlanModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        this.logger.log(`Meal plan soft deleted: ${id}`);
        return deletedPlan!;
    }

    async generateMealPlan(
        userId: string,
        generateDto: GenerateMealPlanDto,
    ): Promise<MealPlanDocument> {
        this.logger.log(`Generating AI meal plan for user ${userId}`);

        // Get suitable foods based on goal and restrictions
        const foods = await this.getSuitableFoods(generateDto);

        if (foods.length < 10) {
            throw new BadRequestException('Not enough suitable foods available for plan generation');
        }

        // Generate meal plan structure
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + generateDto.days - 1);

        const meals: Record<string, any> = {};
        const dailyCalorieTarget = generateDto.targetCalories;

        for (let i = 0; i < generateDto.days; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateString = currentDate.toISOString().split('T')[0];

            meals[dateString] = this.generateDayMeals(foods, dailyCalorieTarget, generateDto);
        }

        const createDto: CreateMealPlanDto = {
            name: `AI Generated ${generateDto.goal.replace('_', ' ')} Plan`,
            description: `AI-generated ${generateDto.days}-day meal plan for ${generateDto.goal.replace('_', ' ')}`,
            type: generateDto.days === 1 ? 'daily' : generateDto.days === 7 ? 'weekly' : 'custom',
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            meals,
            goal: generateDto.goal,
            targetCalories: generateDto.targetCalories,
            status: 'draft',
            isTemplate: false,
        };

        const generatedPlan = await this.create(userId, createDto);

        // Update to mark as AI generated
        await this.mealPlanModel.findByIdAndUpdate(
            generatedPlan._id,
            { createdBy: 'ai_generated' }
        );

        return generatedPlan;
    }

    private async validateFoods(createMealPlanDto: CreateMealPlanDto): Promise<void> {
        const foodIds = new Set<string>();

        Object.values(createMealPlanDto.meals).forEach(dayPlan => {
            ['breakfast', 'lunch', 'dinner', 'snack'].forEach(mealType => {
                dayPlan[mealType]?.forEach(meal => {
                    foodIds.add(meal.foodId);
                });
            });
        });

        const existingFoods = await this.foodModel
            .find({ _id: { $in: Array.from(foodIds) } })
            .exec();

        if (existingFoods.length !== foodIds.size) {
            throw new BadRequestException('Some food items do not exist');
        }
    }

    private async getSuitableFoods(generateDto: GenerateMealPlanDto): Promise<FoodDocument[]> {
        const filter: any = { isActive: true };

        // Add dietary restrictions filtering
        if (generateDto.dietaryRestrictions?.includes('vegetarian')) {
            filter.category = { $nin: ['meat', 'poultry', 'seafood'] };
        }
        if (generateDto.dietaryRestrictions?.includes('gluten-free')) {
            filter.allergens = { $ne: 'gluten' };
        }

        // Goal-based filtering
        if (generateDto.goal === 'weight_loss') {
            filter['nutrition.calories'] = { $lte: 200 }; // Lower calorie foods
        } else if (generateDto.goal === 'muscle_gain') {
            filter['nutrition.protein'] = { $gte: 15 }; // High protein foods
        }

        return this.foodModel
            .find(filter)
            .limit(50)
            .exec();
    }

    private generateDayMeals(foods: FoodDocument[], dailyCalories: number, generateDto: GenerateMealPlanDto): any {
        const mealCalorieDistribution = {
            breakfast: 0.25,
            lunch: 0.35,
            dinner: 0.30,
            snack: 0.10,
        };

        const dayMeals: any = {
            breakfast: [],
            lunch: [],
            dinner: [],
            snack: [],
        };

        // Generate meals for each meal type
        Object.entries(mealCalorieDistribution).forEach(([mealType, calorieRatio]) => {
            if (!generateDto.preferredMealTypes || generateDto.preferredMealTypes.includes(mealType)) {
                const targetCalories = dailyCalories * calorieRatio;
                dayMeals[mealType] = this.generateMealsForType(foods, targetCalories);
            }
        });

        return dayMeals;
    }

    private generateMealsForType(foods: FoodDocument[], targetCalories: number): any[] {
        const selectedFoods = this.getRandomFoods(foods, 2); // 1-2 foods per meal
        const meals: any[] = [];

        let remainingCalories = targetCalories;

        selectedFoods.forEach((food, index) => {
            const calorieRatio = index === selectedFoods.length - 1 ? 1 : Math.random() * 0.7 + 0.3;
            const mealCalories = remainingCalories * calorieRatio;

            // Calculate quantity based on calories
            const quantity = Math.round((mealCalories / food.nutrition.calories) * 100);
            const weight = quantity;

            if (quantity > 0) {
                meals.push({
                    foodId: food._id.toString(),
                    foodName: food.name,
                    quantity,
                    unit: 'grams',
                    weight,
                });
            }

            remainingCalories -= mealCalories;
        });

        return meals;
    }

    private getRandomFoods(foods: FoodDocument[], count: number): FoodDocument[] {
        const shuffled = [...foods].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, Math.min(count, foods.length));
    }

    private transformMealPlan(mealPlan: MealPlanDocument): any {
        const plainObject = mealPlan.toObject();

        // Convert Map to Object for JSON serialization
        plainObject.meals = Object.fromEntries(mealPlan.meals);

        return plainObject;
    }
} 