import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserPreferencesService } from './user-preferences.service';
import {
    UserPreferences,
    UserPreferencesDocument,
    TastePreference,
    RegionalCuisine,
    DietaryRestriction,
    CookingSkill,
    BudgetLevel,
} from '../schemas/user-preferences.schema';

describe('UserPreferencesService', () => {
    let service: UserPreferencesService;
    let model: Model<UserPreferencesDocument>;

    const mockPreferences = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        tastePreferences: [TastePreference.SPICY, TastePreference.UMAMI],
        regionalHabits: [RegionalCuisine.SICHUAN, RegionalCuisine.CANTONESE],
        dietaryRestrictions: [DietaryRestriction.VEGETARIAN],
        cookingTimePreference: 30,
        cookingSkill: CookingSkill.INTERMEDIATE,
        budgetPerMeal: BudgetLevel.MEDIUM,
        favoriteIngredients: ['鸡肉', '西兰花'],
        dislikedIngredients: ['香菜'],
        mealTiming: {
            breakfast: '08:00',
            lunch: '12:00',
            dinner: '18:00',
            snacks: ['10:00', '15:00'],
        },
        nutritionFocus: {
            prioritizeProtein: true,
            limitSodium: false,
            increaseFiber: true,
            limitSugar: true,
            focusOnVitamins: ['vitamin_c', 'iron'],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn().mockReturnThis(),
    } as unknown as UserPreferencesDocument;

    const mockModel = {
        findOne: jest.fn(),
        find: jest.fn(),
        findOneAndUpdate: jest.fn(),
        deleteOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
        exec: jest.fn(),
        populate: jest.fn(),
        select: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserPreferencesService,
                {
                    provide: getModelToken(UserPreferences.name),
                    useValue: mockModel,
                },
            ],
        }).compile();

        service = module.get<UserPreferencesService>(UserPreferencesService);
        model = module.get<Model<UserPreferencesDocument>>(getModelToken(UserPreferences.name));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createPreferences', () => {
        const createPreferencesDto = {
            tastePreferences: [TastePreference.SPICY, TastePreference.UMAMI],
            regionalHabits: [RegionalCuisine.SICHUAN],
            dietaryRestrictions: [DietaryRestriction.VEGETARIAN],
            cookingTimePreference: 30,
            cookingSkill: CookingSkill.INTERMEDIATE,
            budgetPerMeal: BudgetLevel.MEDIUM,
            favoriteIngredients: ['鸡肉'],
            dislikedIngredients: ['香菜'],
        };

        it('should create preferences successfully', async () => {
            const userId = new Types.ObjectId().toString();

            // Mock the findOne method to return null (no existing preferences)
            mockModel.findOne.mockResolvedValue(null);

            // Mock the constructor to return an object with save method
            const savedPreferences = { ...mockPreferences, save: jest.fn().mockResolvedValue(mockPreferences) };
            const ModelConstructor = jest.fn().mockImplementation(() => savedPreferences);

            // Replace the model in the service
            (service as any).userPreferencesModel = Object.assign(ModelConstructor, mockModel);

            const result = await service.createPreferences(userId, createPreferencesDto);

            expect(ModelConstructor).toHaveBeenCalledWith(
                expect.objectContaining({
                    ...createPreferencesDto,
                    userId: expect.any(Types.ObjectId),
                })
            );
            expect(savedPreferences.save).toHaveBeenCalled();
        });

        it('should throw ConflictException if preferences already exist', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockResolvedValue(mockPreferences);

            await expect(service.createPreferences(userId, createPreferencesDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('getPreferencesByUserId', () => {
        it('should return preferences for valid user', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(mockPreferences),
                }),
            });

            const result = await service.getPreferencesByUserId(userId);

            expect(result).toBe(mockPreferences);
            expect(mockModel.findOne).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
        });

        it('should throw NotFoundException if preferences not found', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            await expect(service.getPreferencesByUserId(userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updatePreferences', () => {
        const updateDto = {
            cookingTimePreference: 45,
            budgetPerMeal: BudgetLevel.HIGH,
        };

        it('should update preferences successfully', async () => {
            const userId = new Types.ObjectId().toString();
            const updatedPreferences = { ...mockPreferences, ...updateDto };

            mockModel.findOneAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(updatedPreferences),
                }),
            });

            const result = await service.updatePreferences(userId, updateDto);

            expect(result).toBe(updatedPreferences);
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: new Types.ObjectId(userId) },
                expect.objectContaining({
                    ...updateDto,
                    updatedAt: expect.any(Date),
                }),
                { new: true, runValidators: true }
            );
        });

        it('should throw NotFoundException if preferences not found', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOneAndUpdate.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            await expect(service.updatePreferences(userId, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deletePreferences', () => {
        it('should delete preferences successfully', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            });

            await service.deletePreferences(userId);

            expect(mockModel.deleteOne).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
        });

        it('should throw NotFoundException if preferences not found', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
            });

            await expect(service.deletePreferences(userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('hasPreferences', () => {
        it('should return true if preferences exist', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
                }),
            });

            const result = await service.hasPreferences(userId);

            expect(result).toBe(true);
        });

        it('should return false if preferences do not exist', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            const result = await service.hasPreferences(userId);

            expect(result).toBe(false);
        });
    });

    describe('getOrCreateDefaultPreferences', () => {
        it('should return existing preferences if they exist', async () => {
            const userId = new Types.ObjectId().toString();
            const getPreferencesSpy = jest.spyOn(service, 'getPreferencesByUserId').mockResolvedValue(mockPreferences);

            const result = await service.getOrCreateDefaultPreferences(userId);

            expect(result).toBe(mockPreferences);
            expect(getPreferencesSpy).toHaveBeenCalledWith(userId);
        });

        it('should create default preferences if they do not exist', async () => {
            const userId = new Types.ObjectId().toString();
            const getPreferencesSpy = jest
                .spyOn(service, 'getPreferencesByUserId')
                .mockRejectedValue(new NotFoundException());
            const createPreferencesSpy = jest.spyOn(service, 'createPreferences').mockResolvedValue(mockPreferences);

            const result = await service.getOrCreateDefaultPreferences(userId);

            expect(result).toBe(mockPreferences);
            expect(getPreferencesSpy).toHaveBeenCalledWith(userId);
            expect(createPreferencesSpy).toHaveBeenCalledWith(
                userId,
                expect.objectContaining({
                    tastePreferences: [],
                    regionalHabits: [],
                    dietaryRestrictions: [],
                    cookingTimePreference: 30,
                    dislikedIngredients: [],
                    favoriteIngredients: [],
                })
            );
        });
    });

    describe('addFavoriteIngredient', () => {
        it('should add ingredient to favorites and remove from dislikes', async () => {
            const userId = new Types.ObjectId().toString();
            const ingredient = '豆腐';
            const updatedPreferences = {
                ...mockPreferences,
                favoriteIngredients: [...mockPreferences.favoriteIngredients, ingredient],
            };

            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedPreferences),
            });

            const result = await service.addFavoriteIngredient(userId, ingredient);

            expect(result).toBe(updatedPreferences);
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: new Types.ObjectId(userId) },
                {
                    $addToSet: { favoriteIngredients: ingredient },
                    $pull: { dislikedIngredients: ingredient },
                    updatedAt: expect.any(Date),
                },
                { new: true, runValidators: true }
            );
        });

        it('should throw NotFoundException if preferences not found', async () => {
            const userId = new Types.ObjectId().toString();
            const ingredient = '豆腐';

            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.addFavoriteIngredient(userId, ingredient)).rejects.toThrow(NotFoundException);
        });
    });

    describe('addDislikedIngredient', () => {
        it('should add ingredient to dislikes and remove from favorites', async () => {
            const userId = new Types.ObjectId().toString();
            const ingredient = '芹菜';
            const updatedPreferences = {
                ...mockPreferences,
                dislikedIngredients: [...mockPreferences.dislikedIngredients, ingredient],
            };

            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedPreferences),
            });

            const result = await service.addDislikedIngredient(userId, ingredient);

            expect(result).toBe(updatedPreferences);
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: new Types.ObjectId(userId) },
                {
                    $addToSet: { dislikedIngredients: ingredient },
                    $pull: { favoriteIngredients: ingredient },
                    updatedAt: expect.any(Date),
                },
                { new: true, runValidators: true }
            );
        });
    });

    describe('removeIngredientPreference', () => {
        it('should remove ingredient from both favorites and dislikes', async () => {
            const userId = new Types.ObjectId().toString();
            const ingredient = '香菜';
            const updatedPreferences = {
                ...mockPreferences,
                favoriteIngredients: mockPreferences.favoriteIngredients.filter(i => i !== ingredient),
                dislikedIngredients: mockPreferences.dislikedIngredients.filter(i => i !== ingredient),
            };

            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedPreferences),
            });

            const result = await service.removeIngredientPreference(userId, ingredient);

            expect(result).toBe(updatedPreferences);
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: new Types.ObjectId(userId) },
                {
                    $pull: {
                        favoriteIngredients: ingredient,
                        dislikedIngredients: ingredient,
                    },
                    updatedAt: expect.any(Date),
                },
                { new: true, runValidators: true }
            );
        });
    });

    describe('updateMealTiming', () => {
        it('should update meal timing preferences', async () => {
            const userId = new Types.ObjectId().toString();
            const mealTiming = {
                breakfast: '08:30',
                lunch: '12:30',
                dinner: '18:30',
            };

            const updatePreferencesSpy = jest.spyOn(service, 'updatePreferences').mockResolvedValue(mockPreferences);

            const result = await service.updateMealTiming(userId, mealTiming);

            expect(result).toBe(mockPreferences);
            expect(updatePreferencesSpy).toHaveBeenCalledWith(userId, { mealTiming });
        });
    });

    describe('updateNutritionFocus', () => {
        it('should update nutrition focus preferences', async () => {
            const userId = new Types.ObjectId().toString();
            const nutritionFocus = {
                prioritizeProtein: false,
                limitSodium: true,
                increaseFiber: true,
                limitSugar: false,
                focusOnVitamins: ['vitamin_d', 'calcium'],
            };

            const updatePreferencesSpy = jest.spyOn(service, 'updatePreferences').mockResolvedValue(mockPreferences);

            const result = await service.updateNutritionFocus(userId, nutritionFocus);

            expect(result).toBe(mockPreferences);
            expect(updatePreferencesSpy).toHaveBeenCalledWith(userId, { nutritionFocus });
        });
    });

    describe('getUsersByDietaryRestrictions', () => {
        it('should return users with specific dietary restrictions', async () => {
            const restrictions = [DietaryRestriction.VEGETARIAN, DietaryRestriction.GLUTEN_FREE];
            const preferences = [mockPreferences];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(preferences),
            });

            const result = await service.getUsersByDietaryRestrictions(restrictions);

            expect(result).toBe(preferences);
            expect(mockModel.find).toHaveBeenCalledWith({
                dietaryRestrictions: { $in: restrictions },
            });
        });
    });

    describe('getUsersByTastePreferences', () => {
        it('should return users with specific taste preferences', async () => {
            const tastes = [TastePreference.SPICY, TastePreference.UMAMI];
            const preferences = [mockPreferences];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(preferences),
            });

            const result = await service.getUsersByTastePreferences(tastes);

            expect(result).toBe(preferences);
            expect(mockModel.find).toHaveBeenCalledWith({
                tastePreferences: { $in: tastes },
            });
        });
    });

    describe('getUsersByRegionalPreferences', () => {
        it('should return users with specific regional preferences', async () => {
            const regions = [RegionalCuisine.SICHUAN, RegionalCuisine.CANTONESE];
            const preferences = [mockPreferences];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(preferences),
            });

            const result = await service.getUsersByRegionalPreferences(regions);

            expect(result).toBe(preferences);
            expect(mockModel.find).toHaveBeenCalledWith({
                regionalHabits: { $in: regions },
            });
        });
    });

    describe('getUsersByCookingSkill', () => {
        it('should return users with specific cooking skill level', async () => {
            const skillLevel = CookingSkill.INTERMEDIATE;
            const preferences = [mockPreferences];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(preferences),
            });

            const result = await service.getUsersByCookingSkill(skillLevel);

            expect(result).toBe(preferences);
            expect(mockModel.find).toHaveBeenCalledWith({ cookingSkill: skillLevel });
        });
    });

    describe('getUsersByBudgetLevel', () => {
        it('should return users with specific budget level', async () => {
            const budgetLevel = BudgetLevel.MEDIUM;
            const preferences = [mockPreferences];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(preferences),
            });

            const result = await service.getUsersByBudgetLevel(budgetLevel);

            expect(result).toBe(preferences);
            expect(mockModel.find).toHaveBeenCalledWith({ budgetPerMeal: budgetLevel });
        });
    });
}); 