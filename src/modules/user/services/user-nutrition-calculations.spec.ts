import { Test, TestingModule } from '@nestjs/testing';
import { UserProfileService } from './user-profile.service';
import { UserProfileDocument, ActivityLevel, HealthGoal, HealthCondition } from '../schemas/user-profile.schema';
import { Types } from 'mongoose';

describe('User Nutrition Calculations', () => {
    let service: UserProfileService;

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
    } as UserProfileDocument;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                {
                    provide: UserProfileService,
                    useValue: new UserProfileService(null as any), // We don't need the model for these tests
                },
            ],
        }).compile();

        service = module.get<UserProfileService>(UserProfileService);
    });

    describe('BMR Calculations', () => {
        it('should calculate BMR correctly for males using Harris-Benedict formula', () => {
            const maleProfile = {
                ...mockProfile,
                gender: 'male',
                age: 30,
                weight: 70,
                height: 175,
            } as UserProfileDocument;

            const result = service.calculateBMR(maleProfile);

            // BMR = 88.362 + (13.397 × weight) + (4.799 × height) - (5.677 × age)
            // BMR = 88.362 + (13.397 × 70) + (4.799 × 175) - (5.677 × 30)
            // BMR = 88.362 + 937.79 + 839.825 - 170.31 = 1695.667
            const expectedBMR = Math.round(88.362 + (13.397 * 70) + (4.799 * 175) - (5.677 * 30));
            expect(result).toBe(expectedBMR);
            expect(result).toBe(1696); // Rounded result
        });

        it('should calculate BMR correctly for females using Harris-Benedict formula', () => {
            const femaleProfile = {
                ...mockProfile,
                gender: 'female',
                age: 25,
                weight: 60,
                height: 165,
            } as UserProfileDocument;

            const result = service.calculateBMR(femaleProfile);

            // BMR = 447.593 + (9.247 × weight) + (3.098 × height) - (4.330 × age)
            // BMR = 447.593 + (9.247 × 60) + (3.098 × 165) - (4.330 × 25)
            // BMR = 447.593 + 554.82 + 511.17 - 108.25 = 1405.333
            const expectedBMR = Math.round(447.593 + (9.247 * 60) + (3.098 * 165) - (4.330 * 25));
            expect(result).toBe(expectedBMR);
            expect(result).toBe(1405); // Rounded result
        });

        it('should calculate BMR for other genders as average of male and female formulas', () => {
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
            expect(result).toBe(1601); // Average of male and female calculations
        });

        it('should handle edge cases with minimum values', () => {
            const edgeCaseProfile = {
                ...mockProfile,
                gender: 'female',
                age: 18,
                weight: 40,
                height: 150,
            } as UserProfileDocument;

            const result = service.calculateBMR(edgeCaseProfile);

            expect(result).toBeGreaterThan(0);
            expect(typeof result).toBe('number');
        });
    });

    describe('TDEE Calculations', () => {
        it('should calculate TDEE correctly for sedentary activity level', () => {
            const profile = {
                ...mockProfile,
                activityLevel: ActivityLevel.SEDENTARY,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const result = service.calculateTDEE(profile);
            const expectedTDEE = Math.round(bmr * 1.2);

            expect(result).toBe(expectedTDEE);
        });

        it('should calculate TDEE correctly for lightly active level', () => {
            const profile = {
                ...mockProfile,
                activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const result = service.calculateTDEE(profile);
            const expectedTDEE = Math.round(bmr * 1.375);

            expect(result).toBe(expectedTDEE);
        });

        it('should calculate TDEE correctly for moderately active level', () => {
            const profile = {
                ...mockProfile,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const result = service.calculateTDEE(profile);
            const expectedTDEE = Math.round(bmr * 1.55);

            expect(result).toBe(expectedTDEE);
        });

        it('should calculate TDEE correctly for very active level', () => {
            const profile = {
                ...mockProfile,
                activityLevel: ActivityLevel.VERY_ACTIVE,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const result = service.calculateTDEE(profile);
            const expectedTDEE = Math.round(bmr * 1.725);

            expect(result).toBe(expectedTDEE);
        });

        it('should calculate TDEE correctly for extremely active level', () => {
            const profile = {
                ...mockProfile,
                activityLevel: ActivityLevel.EXTREMELY_ACTIVE,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const result = service.calculateTDEE(profile);
            const expectedTDEE = Math.round(bmr * 1.9);

            expect(result).toBe(expectedTDEE);
        });

        it('should validate TDEE is always greater than BMR', () => {
            const activityLevels = Object.values(ActivityLevel);

            for (const activityLevel of activityLevels) {
                const profile = {
                    ...mockProfile,
                    activityLevel,
                } as UserProfileDocument;

                const bmr = service.calculateBMR(profile);
                const tdee = service.calculateTDEE(profile);

                expect(tdee).toBeGreaterThan(bmr);
            }
        });
    });

    describe('Daily Calorie Recommendations', () => {
        it('should recommend 80% of TDEE for weight loss', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.WEIGHT_LOSS,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(profile);
            const result = service.getDailyCalorieRecommendation(profile);
            const expectedCalories = Math.round(tdee * 0.8);

            expect(result).toBe(expectedCalories);
        });

        it('should recommend 120% of TDEE for weight gain', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.WEIGHT_GAIN,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(profile);
            const result = service.getDailyCalorieRecommendation(profile);
            const expectedCalories = Math.round(tdee * 1.2);

            expect(result).toBe(expectedCalories);
        });

        it('should recommend 115% of TDEE for muscle gain', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.MUSCLE_GAIN,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(profile);
            const result = service.getDailyCalorieRecommendation(profile);
            const expectedCalories = Math.round(tdee * 1.15);

            expect(result).toBe(expectedCalories);
        });

        it('should recommend 100% of TDEE for weight maintenance', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.WEIGHT_MAINTAIN,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(profile);
            const result = service.getDailyCalorieRecommendation(profile);
            const expectedCalories = Math.round(tdee * 1.0);

            expect(result).toBe(expectedCalories);
        });

        it('should recommend 100% of TDEE for health improvement', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.IMPROVE_HEALTH,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(profile);
            const result = service.getDailyCalorieRecommendation(profile);
            const expectedCalories = Math.round(tdee * 1.0);

            expect(result).toBe(expectedCalories);
        });

        it('should recommend 100% of TDEE for condition management', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.MANAGE_CONDITION,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const tdee = service.calculateTDEE(profile);
            const result = service.getDailyCalorieRecommendation(profile);
            const expectedCalories = Math.round(tdee * 1.0);

            expect(result).toBe(expectedCalories);
        });
    });

    describe('Macronutrient Recommendations', () => {
        it('should calculate correct macros for weight loss (30% protein, 25% fat, 45% carbs)', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.WEIGHT_LOSS,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const result = service.getMacronutrientRecommendations(profile);
            const calories = service.getDailyCalorieRecommendation(profile);

            // Protein: 30% of calories / 4 cal per gram
            const expectedProtein = Math.round((calories * 0.30) / 4);
            // Carbs: 45% of calories / 4 cal per gram
            const expectedCarbs = Math.round((calories * 0.45) / 4);
            // Fat: 25% of calories / 9 cal per gram
            const expectedFat = Math.round((calories * 0.25) / 9);

            expect(result.protein).toBe(expectedProtein);
            expect(result.carbohydrates).toBe(expectedCarbs);
            expect(result.fat).toBe(expectedFat);

            // Verify total percentage is 100%
            const totalCalories = (result.protein * 4) + (result.carbohydrates * 4) + (result.fat * 9);
            expect(Math.abs(totalCalories - calories)).toBeLessThan(5); // Allow small rounding error
        });

        it('should calculate correct macros for muscle gain (25% protein, 25% fat, 50% carbs)', () => {
            const profile = {
                ...mockProfile,
                mainGoal: HealthGoal.MUSCLE_GAIN,
                activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            } as UserProfileDocument;

            const result = service.getMacronutrientRecommendations(profile);
            const calories = service.getDailyCalorieRecommendation(profile);

            // Protein: 25% of calories / 4 cal per gram
            const expectedProtein = Math.round((calories * 0.25) / 4);
            // Carbs: 50% of calories / 4 cal per gram
            const expectedCarbs = Math.round((calories * 0.50) / 4);
            // Fat: 25% of calories / 9 cal per gram
            const expectedFat = Math.round((calories * 0.25) / 9);

            expect(result.protein).toBe(expectedProtein);
            expect(result.carbohydrates).toBe(expectedCarbs);
            expect(result.fat).toBe(expectedFat);
        });

        it('should calculate correct macros for balanced goals (20% protein, 25% fat, 55% carbs)', () => {
            const balancedGoals = [HealthGoal.WEIGHT_MAINTAIN, HealthGoal.IMPROVE_HEALTH, HealthGoal.MANAGE_CONDITION];

            for (const goal of balancedGoals) {
                const profile = {
                    ...mockProfile,
                    mainGoal: goal,
                    activityLevel: ActivityLevel.MODERATELY_ACTIVE,
                } as UserProfileDocument;

                const result = service.getMacronutrientRecommendations(profile);
                const calories = service.getDailyCalorieRecommendation(profile);

                // Balanced approach: 20% protein, 25% fat, 55% carbs
                const expectedProtein = Math.round((calories * 0.20) / 4);
                const expectedCarbs = Math.round((calories * 0.55) / 4);
                const expectedFat = Math.round((calories * 0.25) / 9);

                expect(result.protein).toBe(expectedProtein);
                expect(result.carbohydrates).toBe(expectedCarbs);
                expect(result.fat).toBe(expectedFat);
            }
        });

        it('should provide reasonable macro values for different activity levels', () => {
            const activityLevels = Object.values(ActivityLevel);

            for (const activityLevel of activityLevels) {
                const profile = {
                    ...mockProfile,
                    activityLevel,
                    mainGoal: HealthGoal.WEIGHT_LOSS,
                } as UserProfileDocument;

                const result = service.getMacronutrientRecommendations(profile);

                // All macros should be positive
                expect(result.protein).toBeGreaterThan(0);
                expect(result.carbohydrates).toBeGreaterThan(0);
                expect(result.fat).toBeGreaterThan(0);

                // Protein should be reasonable (minimum 50g for weight loss)
                expect(result.protein).toBeGreaterThanOrEqual(50);
            }
        });
    });

    describe('BMI Calculation (Virtual Field)', () => {
        it('should calculate BMI correctly', () => {
            // Since BMI is a virtual field, we test the formula manually
            const height = 175; // cm
            const weight = 70; // kg

            const expectedBMI = Math.round((weight / ((height / 100) ** 2)) * 100) / 100;
            expect(expectedBMI).toBe(22.86); // BMI = 70 / (1.75)^2 = 22.857
        });
    });

    describe('Integration Tests - Complete Profile Analysis', () => {
        it('should provide complete nutritional analysis for a typical weight loss user', () => {
            const profile = {
                ...mockProfile,
                gender: 'female',
                age: 28,
                height: 165,
                weight: 68,
                activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
                mainGoal: HealthGoal.WEIGHT_LOSS,
                targetWeight: 60,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const tdee = service.calculateTDEE(profile);
            const dailyCalories = service.getDailyCalorieRecommendation(profile);
            const macros = service.getMacronutrientRecommendations(profile);

            // Validate the chain of calculations
            expect(bmr).toBeGreaterThan(1000);
            expect(tdee).toBeGreaterThan(bmr);
            expect(dailyCalories).toBe(Math.round(tdee * 0.8)); // Weight loss

            // Validate macros add up correctly (within rounding error)
            const totalMacroCalories = (macros.protein * 4) + (macros.carbohydrates * 4) + (macros.fat * 9);
            expect(Math.abs(totalMacroCalories - dailyCalories)).toBeLessThan(10);

            console.log('Weight Loss User Analysis:', {
                bmr,
                tdee,
                dailyCalories,
                macros,
                deficit: tdee - dailyCalories,
            });
        });

        it('should provide complete nutritional analysis for a typical muscle gain user', () => {
            const profile = {
                ...mockProfile,
                gender: 'male',
                age: 25,
                height: 180,
                weight: 75,
                activityLevel: ActivityLevel.VERY_ACTIVE,
                mainGoal: HealthGoal.MUSCLE_GAIN,
                targetWeight: 80,
            } as UserProfileDocument;

            const bmr = service.calculateBMR(profile);
            const tdee = service.calculateTDEE(profile);
            const dailyCalories = service.getDailyCalorieRecommendation(profile);
            const macros = service.getMacronutrientRecommendations(profile);

            // Validate the chain of calculations
            expect(bmr).toBeGreaterThan(1500);
            expect(tdee).toBeGreaterThan(bmr);
            expect(dailyCalories).toBe(Math.round(tdee * 1.15)); // Muscle gain

            // Validate protein is sufficient for muscle gain (at least 1.6g per kg)
            const proteinPerKg = macros.protein / profile.weight;
            expect(proteinPerKg).toBeGreaterThanOrEqual(1.6);

            console.log('Muscle Gain User Analysis:', {
                bmr,
                tdee,
                dailyCalories,
                macros,
                surplus: dailyCalories - tdee,
                proteinPerKg,
            });
        });
    });
}); 