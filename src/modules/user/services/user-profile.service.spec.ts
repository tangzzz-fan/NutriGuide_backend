import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserProfileService } from './user-profile.service';
import { UserProfile, UserProfileDocument, ActivityLevel, HealthGoal, HealthCondition } from '../schemas/user-profile.schema';

describe('UserProfileService', () => {
    let service: UserProfileService;
    let mockModel: jest.Mocked<Model<UserProfileDocument>> & {
        findOne: jest.Mock;
        find: jest.Mock;
        findOneAndUpdate: jest.Mock;
        deleteOne: jest.Mock;
    };

    const mockProfile = {
        _id: new Types.ObjectId(),
        userId: new Types.ObjectId(),
        gender: 'male',
        age: 30,
        height: 175,
        weight: 70,
        activityLevel: ActivityLevel.MODERATELY_ACTIVE,
        healthConditions: [HealthCondition.NONE],
        allergies: [],
        mainGoal: HealthGoal.WEIGHT_LOSS,
        targetWeight: 65,
        goalTimeline: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
        toJSON: jest.fn().mockReturnThis(),
    } as unknown as UserProfileDocument;

    // Create a complete mock for the Mongoose model
    const createMockModel = () => {
        const mockInstance = {
            save: jest.fn().mockResolvedValue(mockProfile),
        };

        const MockModel = jest.fn().mockImplementation(() => mockInstance) as any;

        MockModel.findOne = jest.fn();
        MockModel.find = jest.fn();
        MockModel.findOneAndUpdate = jest.fn();
        MockModel.deleteOne = jest.fn();

        return MockModel;
    };

    beforeEach(async () => {
        mockModel = createMockModel();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserProfileService,
                {
                    provide: getModelToken(UserProfile.name),
                    useValue: mockModel,
                },
            ],
        }).compile();

        service = module.get<UserProfileService>(UserProfileService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createProfile', () => {
        const createProfileDto = {
            gender: 'male',
            age: 30,
            height: 175,
            weight: 70,
            activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            healthConditions: [HealthCondition.NONE],
            allergies: [],
            mainGoal: HealthGoal.WEIGHT_LOSS,
            targetWeight: 65,
            goalTimeline: 12,
        };

        it('should create a new profile successfully', async () => {
            const userId = new Types.ObjectId().toString();

            // Mock findOne to return null (no existing profile)
            mockModel.findOne.mockResolvedValue(null);

            const result = await service.createProfile(userId, createProfileDto);

            expect(mockModel.findOne).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
            expect(mockModel).toHaveBeenCalledWith({
                ...createProfileDto,
                userId: new Types.ObjectId(userId),
            });
        });

        it('should throw ConflictException if profile already exists', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockResolvedValue(mockProfile);

            await expect(service.createProfile(userId, createProfileDto)).rejects.toThrow(ConflictException);
        });
    });

    describe('getProfileByUserId', () => {
        it('should return profile for valid user', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(mockProfile),
            });

            const result = await service.getProfileByUserId(userId);

            expect(result).toBe(mockProfile);
            expect(mockModel.findOne).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
        });

        it('should throw NotFoundException if profile not found', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.getProfileByUserId(userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('updateProfile', () => {
        const updateDto = {
            weight: 68,
            activityLevel: ActivityLevel.VERY_ACTIVE,
        };

        it('should update profile successfully', async () => {
            const userId = new Types.ObjectId().toString();
            const updatedProfile = { ...mockProfile, ...updateDto };

            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(updatedProfile),
            });

            const result = await service.updateProfile(userId, updateDto);

            expect(result).toBe(updatedProfile);
            expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
                { userId: new Types.ObjectId(userId) },
                expect.objectContaining({
                    ...updateDto,
                    updatedAt: expect.any(Date),
                }),
                { new: true, runValidators: true }
            );
        });

        it('should throw NotFoundException if profile not found', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOneAndUpdate.mockReturnValue({
                exec: jest.fn().mockResolvedValue(null),
            });

            await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(NotFoundException);
        });
    });

    describe('deleteProfile', () => {
        it('should delete profile successfully', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
            });

            await service.deleteProfile(userId);

            expect(mockModel.deleteOne).toHaveBeenCalledWith({ userId: new Types.ObjectId(userId) });
        });

        it('should throw NotFoundException if profile not found', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.deleteOne.mockReturnValue({
                exec: jest.fn().mockResolvedValue({ deletedCount: 0 }),
            });

            await expect(service.deleteProfile(userId)).rejects.toThrow(NotFoundException);
        });
    });

    describe('hasProfile', () => {
        it('should return true if profile exists', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue({ _id: new Types.ObjectId() }),
                }),
            });

            const result = await service.hasProfile(userId);

            expect(result).toBe(true);
        });

        it('should return false if profile does not exist', async () => {
            const userId = new Types.ObjectId().toString();
            mockModel.findOne.mockReturnValue({
                select: jest.fn().mockReturnValue({
                    exec: jest.fn().mockResolvedValue(null),
                }),
            });

            const result = await service.hasProfile(userId);

            expect(result).toBe(false);
        });
    });

    describe('calculateBMR', () => {
        it('should calculate BMR for male correctly', async () => {
            const maleProfile = {
                ...mockProfile,
                gender: 'male',
                age: 30,
                weight: 70,
                height: 175,
            } as UserProfileDocument;

            const result = service.calculateBMR(maleProfile);

            // BMR = 88.362 + (13.397 × 70) + (4.799 × 175) - (5.677 × 30)
            const expectedBMR = Math.round(88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * 30));
            expect(result).toBe(expectedBMR);
        });

        it('should calculate BMR for female correctly', async () => {
            const femaleProfile = {
                ...mockProfile,
                gender: 'female',
                age: 25,
                weight: 60,
                height: 165,
            } as UserProfileDocument;

            const result = service.calculateBMR(femaleProfile);

            // BMR = 447.593 + (9.247 × 60) + (3.098 × 165) - (4.330 × 25)
            const expectedBMR = Math.round(447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * 25));
            expect(result).toBe(expectedBMR);
        });

        it('should calculate BMR for other gender as average', async () => {
            const otherProfile = {
                ...mockProfile,
                gender: 'other',
                age: 30,
                weight: 70,
                height: 175,
            } as UserProfileDocument;

            const result = service.calculateBMR(otherProfile);

            const maleBMR = 88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * 30);
            const femaleBMR = 447.593 + (9.247 * 70) + (3.098 * 175) - (4.330 * 30);
            const expectedBMR = Math.round((maleBMR + femaleBMR) / 2);

            expect(result).toBe(expectedBMR);
        });
    });

    describe('calculateTDEE', () => {
        it('should calculate TDEE correctly for different activity levels', async () => {
            const testCases = [
                { activityLevel: ActivityLevel.SEDENTARY, multiplier: 1.2 },
                { activityLevel: ActivityLevel.LIGHTLY_ACTIVE, multiplier: 1.375 },
                { activityLevel: ActivityLevel.MODERATELY_ACTIVE, multiplier: 1.55 },
                { activityLevel: ActivityLevel.VERY_ACTIVE, multiplier: 1.725 },
                { activityLevel: ActivityLevel.EXTREMELY_ACTIVE, multiplier: 1.9 },
            ];

            for (const testCase of testCases) {
                const profile = {
                    ...mockProfile,
                    activityLevel: testCase.activityLevel,
                } as UserProfileDocument;

                const bmr = service.calculateBMR(profile);
                const result = service.calculateTDEE(profile);
                const expectedTDEE = Math.round(bmr * testCase.multiplier);

                expect(result).toBe(expectedTDEE);
            }
        });
    });

    describe('getDailyCalorieRecommendation', () => {
        it('should calculate daily calories correctly for different goals', async () => {
            const baseProfile = {
                ...mockProfile,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(baseProfile);

            const testCases = [
                { goal: HealthGoal.WEIGHT_LOSS, expectedRatio: 0.8 },
                { goal: HealthGoal.WEIGHT_GAIN, expectedRatio: 1.2 },
                { goal: HealthGoal.MUSCLE_GAIN, expectedRatio: 1.15 },
                { goal: HealthGoal.WEIGHT_MAINTAIN, expectedRatio: 1.0 },
                { goal: HealthGoal.IMPROVE_HEALTH, expectedRatio: 1.0 },
                { goal: HealthGoal.MANAGE_CONDITION, expectedRatio: 1.0 },
            ];

            for (const testCase of testCases) {
                const profile = {
                    ...baseProfile,
                    mainGoal: testCase.goal,
                } as UserProfileDocument;

                const result = service.getDailyCalorieRecommendation(profile);
                const expectedCalories = Math.round(tdee * testCase.expectedRatio);

                expect(result).toBe(expectedCalories);
            }
        });
    });

    describe('getMacronutrientRecommendations', () => {
        it('should calculate macronutrients correctly for weight loss', async () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.WEIGHT_LOSS,
            } as UserProfileDocument;

            const result = service.getMacronutrientRecommendations(profile);
            const calories = service.getDailyCalorieRecommendation(profile);

            // For weight loss: 30% protein, 25% fat, 45% carbs
            const expectedProtein = Math.round((calories * 0.30) / 4);
            const expectedCarbs = Math.round((calories * 0.45) / 4);
            const expectedFat = Math.round((calories * 0.25) / 9);

            expect(result.protein).toBe(expectedProtein);
            expect(result.carbohydrates).toBe(expectedCarbs);
            expect(result.fat).toBe(expectedFat);
        });

        it('should calculate macronutrients correctly for muscle gain', async () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.MUSCLE_GAIN,
            } as UserProfileDocument;

            const result = service.getMacronutrientRecommendations(profile);
            const calories = service.getDailyCalorieRecommendation(profile);

            // For muscle gain: 25% protein, 25% fat, 50% carbs
            const expectedProtein = Math.round((calories * 0.25) / 4);
            const expectedCarbs = Math.round((calories * 0.50) / 4);
            const expectedFat = Math.round((calories * 0.25) / 9);

            expect(result.protein).toBe(expectedProtein);
            expect(result.carbohydrates).toBe(expectedCarbs);
            expect(result.fat).toBe(expectedFat);
        });
    });

    describe('getProfilesByGoal', () => {
        it('should return profiles with specific goal', async () => {
            const goal = HealthGoal.WEIGHT_LOSS;
            const profiles = [mockProfile];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(profiles),
            });

            const result = await service.getProfilesByGoal(goal);

            expect(result).toBe(profiles);
            expect(mockModel.find).toHaveBeenCalledWith({ mainGoal: goal });
        });
    });

    describe('getProfilesByActivityLevel', () => {
        it('should return profiles with specific activity level', async () => {
            const activityLevel = ActivityLevel.MODERATELY_ACTIVE;
            const profiles = [mockProfile];

            mockModel.find.mockReturnValue({
                exec: jest.fn().mockResolvedValue(profiles),
            });

            const result = await service.getProfilesByActivityLevel(activityLevel);

            expect(result).toBe(profiles);
            expect(mockModel.find).toHaveBeenCalledWith({ activityLevel });
        });
    });
}); 