import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NutritionService } from './nutrition.service';
import { FoodLog } from '../food-logs/schemas/food-log.schema';

describe('NutritionService', () => {
    let service: NutritionService;
    let foodLogModel: Model<FoodLog>;

    const mockFoodLogModel = {
        find: jest.fn(),
        countDocuments: jest.fn(),
        aggregate: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                NutritionService,
                {
                    provide: getModelToken(FoodLog.name),
                    useValue: mockFoodLogModel,
                },
            ],
        }).compile();

        service = module.get<NutritionService>(NutritionService);
        foodLogModel = module.get<Model<FoodLog>>(getModelToken(FoodLog.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('getDailyNutrition', () => {
        it('should return daily nutrition data', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const date = '2024-01-27';

            const mockLogs = [
                {
                    mealType: 'breakfast',
                    nutrition: {
                        calories: 300,
                        protein: 10,
                        carbohydrates: 40,
                        fat: 8,
                        fiber: 5,
                        sugar: 15,
                    },
                },
                {
                    mealType: 'lunch',
                    nutrition: {
                        calories: 450,
                        protein: 25,
                        carbohydrates: 50,
                        fat: 15,
                        fiber: 8,
                        sugar: 20,
                    },
                },
            ];

            mockFoodLogModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockLogs),
            });

            const result = await service.getDailyNutrition(userId, date);

            expect(result).toBeDefined();
            expect(result.date).toBe(date);
            expect(result.totalCalories).toBe(750);
            expect(result.totalProtein).toBe(35);
            expect(result.foodEntryCount).toBe(2);
            expect(mockFoodLogModel.find).toHaveBeenCalled();
        });
    });
}); 