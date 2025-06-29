import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FoodLogsService } from './food-logs.service';
import { FoodLog } from './schemas/food-log.schema';
import { Food } from '../food/schemas/food.schema';

describe('FoodLogsService', () => {
    let service: FoodLogsService;
    let foodLogModel: Model<FoodLog>;
    let foodModel: Model<Food>;

    const mockFoodLogModel = {
        new: jest.fn(),
        constructor: jest.fn(),
        find: jest.fn(),
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findByIdAndDelete: jest.fn(),
        findOne: jest.fn(),
        countDocuments: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
    };

    const mockFoodModel = {
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                FoodLogsService,
                {
                    provide: getModelToken(FoodLog.name),
                    useValue: mockFoodLogModel,
                },
                {
                    provide: getModelToken(Food.name),
                    useValue: mockFoodModel,
                },
            ],
        }).compile();

        service = module.get<FoodLogsService>(FoodLogsService);
        foodLogModel = module.get<Model<FoodLog>>(getModelToken(FoodLog.name));
        foodModel = module.get<Model<Food>>(getModelToken(Food.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a food log', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const createFoodLogDto = {
                foodId: '507f1f77bcf86cd799439012',
                consumedAt: '2024-01-27T12:00:00.000Z',
                mealType: 'lunch',
                quantity: 150,
                unit: 'grams',
            };

            const mockFood = {
                _id: '507f1f77bcf86cd799439012',
                name: 'Apple',
                nutrition: {
                    calories: 52,
                    protein: 0.3,
                    carbohydrates: 14,
                    fat: 0.2,
                },
            };

            const mockSavedLog = {
                _id: '507f1f77bcf86cd799439013',
                ...createFoodLogDto,
                userId,
                foodName: 'Apple',
                nutrition: {
                    calories: 78,
                    protein: 0.45,
                    carbohydrates: 21,
                    fat: 0.3,
                },
            };

            mockFoodModel.findById.mockResolvedValue(mockFood);
            mockFoodLogModel.create.mockResolvedValue(mockSavedLog);

            const result = await service.create(userId, createFoodLogDto as any);

            expect(mockFoodModel.findById).toHaveBeenCalledWith(createFoodLogDto.foodId);
            expect(result).toBeDefined();
        });
    });
}); 