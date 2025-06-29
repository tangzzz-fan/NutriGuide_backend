import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { FoodLog, FoodLogDocument } from './schemas/food-log.schema';
import { Food, FoodDocument } from '../food/schemas/food.schema';
import { CreateFoodLogDto } from './dto/create-food-log.dto';
import { UpdateFoodLogDto } from './dto/update-food-log.dto';
import { FoodLogQueryDto } from './dto/food-log-query.dto';
import { FoodLogListResponseDto } from './dto/food-log-response.dto';

@Injectable()
export class FoodLogsService {
    private readonly logger = new Logger(FoodLogsService.name);

    constructor(
        @InjectModel(FoodLog.name)
        private readonly foodLogModel: Model<FoodLogDocument>,
        @InjectModel(Food.name)
        private readonly foodModel: Model<FoodDocument>,
    ) { }

    async create(
        userId: string,
        createFoodLogDto: CreateFoodLogDto,
    ): Promise<FoodLogDocument> {
        this.logger.log(`Creating food log for user ${userId}`);

        // Validate food exists
        const food = await this.foodModel.findById(createFoodLogDto.foodId);
        if (!food) {
            throw new NotFoundException('Food not found');
        }

        // Calculate weight if not provided (assume quantity equals weight in grams)
        const weight = createFoodLogDto.weight || createFoodLogDto.quantity;

        // Calculate nutrition based on consumed weight
        const nutrition = this.calculateNutrition(food.nutrition, weight);

        const foodLogData = {
            ...createFoodLogDto,
            userId: new Types.ObjectId(userId),
            foodId: new Types.ObjectId(createFoodLogDto.foodId),
            foodName: food.name,
            weight,
            nutrition,
            consumedAt: new Date(createFoodLogDto.consumedAt),
        };

        const savedFoodLog = await this.foodLogModel.create(foodLogData);

        this.logger.log(`Food log created successfully: ${savedFoodLog._id}`);
        return savedFoodLog;
    }

    async findAll(
        userId: string,
        query: FoodLogQueryDto,
    ): Promise<FoodLogListResponseDto> {
        const {
            startDate,
            endDate,
            mealType,
            foodName,
            page = 1,
            limit = 10,
            sortBy = 'consumedAt',
            sortOrder = 'desc',
        } = query;

        // Build filter
        const filter: any = {
            userId: new Types.ObjectId(userId),
            isActive: true,
        };

        if (startDate || endDate) {
            filter.consumedAt = {};
            if (startDate) {
                filter.consumedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filter.consumedAt.$lte = new Date(endDate);
            }
        }

        if (mealType) {
            filter.mealType = mealType;
        }

        if (foodName) {
            filter.foodName = { $regex: foodName, $options: 'i' };
        }

        // Build sort object
        const sort: any = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const skip = (page - 1) * limit;
        const [items, total] = await Promise.all([
            this.foodLogModel
                .find(filter)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('foodId', 'name nameEn category')
                .exec(),
            this.foodLogModel.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(total / limit);

        return {
            items: items as any,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findDailyLogs(userId: string, date: string): Promise<FoodLogDocument[]> {
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        return this.foodLogModel
            .find({
                userId: new Types.ObjectId(userId),
                consumedAt: { $gte: startDate, $lte: endDate },
                isActive: true,
            })
            .sort({ consumedAt: 1 })
            .populate('foodId', 'name nameEn category')
            .exec();
    }

    async findOne(userId: string, id: string): Promise<FoodLogDocument> {
        if (!Types.ObjectId.isValid(id)) {
            throw new BadRequestException('Invalid food log ID');
        }

        const foodLog = await this.foodLogModel
            .findOne({
                _id: new Types.ObjectId(id),
                userId: new Types.ObjectId(userId),
                isActive: true,
            })
            .populate('foodId', 'name nameEn category nutrition')
            .exec();

        if (!foodLog) {
            throw new NotFoundException('Food log not found');
        }

        return foodLog;
    }

    async update(
        userId: string,
        id: string,
        updateFoodLogDto: UpdateFoodLogDto,
    ): Promise<FoodLogDocument> {
        const existingLog = await this.findOne(userId, id);

        let updatedData: any = { ...updateFoodLogDto };

        // If food is changed, update nutrition calculation
        if (updateFoodLogDto.foodId && updateFoodLogDto.foodId !== existingLog.foodId.toString()) {
            const food = await this.foodModel.findById(updateFoodLogDto.foodId);
            if (!food) {
                throw new NotFoundException('Food not found');
            }
            updatedData.foodName = food.name;
            updatedData.foodId = new Types.ObjectId(updateFoodLogDto.foodId);
        }

        // Recalculate nutrition if quantity or weight changed
        if (updateFoodLogDto.quantity !== undefined || updateFoodLogDto.weight !== undefined) {
            const weight = updateFoodLogDto.weight || updateFoodLogDto.quantity || existingLog.weight;
            let food;

            if (updateFoodLogDto.foodId) {
                food = await this.foodModel.findById(updateFoodLogDto.foodId);
            } else {
                food = await this.foodModel.findById(existingLog.foodId);
            }

            if (food) {
                updatedData.nutrition = this.calculateNutrition(food.nutrition, weight);
                updatedData.weight = weight;
            }
        }

        if (updateFoodLogDto.consumedAt) {
            updatedData.consumedAt = new Date(updateFoodLogDto.consumedAt);
        }

        const updatedLog = await this.foodLogModel
            .findByIdAndUpdate(id, updatedData, { new: true })
            .populate('foodId', 'name nameEn category')
            .exec();

        this.logger.log(`Food log updated successfully: ${id}`);
        return updatedLog!;
    }

    async remove(userId: string, id: string): Promise<FoodLogDocument> {
        const foodLog = await this.findOne(userId, id);

        // Soft delete
        const deletedLog = await this.foodLogModel
            .findByIdAndUpdate(id, { isActive: false }, { new: true })
            .exec();

        this.logger.log(`Food log soft deleted: ${id}`);
        return deletedLog!;
    }

    async copyToDate(
        userId: string,
        id: string,
        targetDate: string,
    ): Promise<FoodLogDocument> {
        const originalLog = await this.findOne(userId, id);

        const copyData = {
            userId: originalLog.userId,
            foodId: originalLog.foodId,
            foodName: originalLog.foodName,
            consumedAt: new Date(targetDate),
            mealType: originalLog.mealType,
            quantity: originalLog.quantity,
            unit: originalLog.unit,
            weight: originalLog.weight,
            nutrition: originalLog.nutrition,
            notes: originalLog.notes,
            tags: originalLog.tags,
        };

        const copiedLog = new this.foodLogModel(copyData);
        const savedLog = await copiedLog.save();

        this.logger.log(`Food log copied to ${targetDate}: ${savedLog._id}`);
        return savedLog;
    }

    private calculateNutrition(foodNutrition: any, weightInGrams: number): any {
        const ratio = weightInGrams / 100; // Nutrition is per 100g

        return {
            calories: Math.round((foodNutrition.calories || 0) * ratio),
            protein: Math.round((foodNutrition.protein || 0) * ratio * 10) / 10,
            carbohydrates: Math.round((foodNutrition.carbohydrates || 0) * ratio * 10) / 10,
            fat: Math.round((foodNutrition.fat || 0) * ratio * 10) / 10,
            fiber: foodNutrition.fiber ? Math.round((foodNutrition.fiber || 0) * ratio * 10) / 10 : undefined,
            sugar: foodNutrition.sugar ? Math.round((foodNutrition.sugar || 0) * ratio * 10) / 10 : undefined,
            sodium: foodNutrition.sodium ? Math.round((foodNutrition.sodium || 0) * ratio * 10) / 10 : undefined,
            potassium: foodNutrition.potassium ? Math.round((foodNutrition.potassium || 0) * ratio * 10) / 10 : undefined,
            calcium: foodNutrition.calcium ? Math.round((foodNutrition.calcium || 0) * ratio * 10) / 10 : undefined,
            iron: foodNutrition.iron ? Math.round((foodNutrition.iron || 0) * ratio * 100) / 100 : undefined,
            vitaminC: foodNutrition.vitaminC ? Math.round((foodNutrition.vitaminC || 0) * ratio * 10) / 10 : undefined,
            vitaminA: foodNutrition.vitaminA ? Math.round((foodNutrition.vitaminA || 0) * ratio * 10) / 10 : undefined,
        };
    }
} 