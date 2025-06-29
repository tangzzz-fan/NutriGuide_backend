import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MealPlansService } from './meal-plans.service';
import { MealPlan } from './schemas/meal-plan.schema';
import { Food } from '../food/schemas/food.schema';

describe('MealPlansService', () => {
    let service: MealPlansService;
    let mealPlanModel: Model<MealPlan>;
    let foodModel: Model<Food>;

    const mockMealPlanModel = {
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
        find: jest.fn(),
        findById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                MealPlansService,
                {
                    provide: getModelToken(MealPlan.name),
                    useValue: mockMealPlanModel,
                },
                {
                    provide: getModelToken(Food.name),
                    useValue: mockFoodModel,
                },
            ],
        }).compile();

        service = module.get<MealPlansService>(MealPlansService);
        mealPlanModel = module.get<Model<MealPlan>>(getModelToken(MealPlan.name));
        foodModel = module.get<Model<Food>>(getModelToken(Food.name));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a meal plan', async () => {
            const userId = '507f1f77bcf86cd799439011';
            const createMealPlanDto = {
                name: 'Test Plan',
                type: 'weekly',
                startDate: '2024-01-27',
                endDate: '2024-02-02',
                meals: {
                    '2024-01-27': {
                        breakfast: [
                            {
                                foodId: '507f1f77bcf86cd799439012',
                                foodName: 'Apple',
                                quantity: 150,
                                unit: 'grams',
                                weight: 150,
                            },
                        ],
                        lunch: [],
                        dinner: [],
                        snack: [],
                    },
                },
            };

            const mockFoods = [{ _id: '507f1f77bcf86cd799439012' }];
            const mockSavedPlan = {
                _id: '507f1f77bcf86cd799439013',
                ...createMealPlanDto,
                userId,
            };

            mockFoodModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockFoods),
            });

            mockMealPlanModel.create.mockResolvedValue(mockSavedPlan);

            const result = await service.create(userId, createMealPlanDto as any);

            expect(result).toBeDefined();
            expect(mockFoodModel.find).toHaveBeenCalled();
        });
    });
}); 