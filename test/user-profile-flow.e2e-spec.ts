import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import supertest from 'supertest';
import { AppModule } from '../src/app.module';
import { ActivityLevel, HealthGoal, HealthCondition } from '../src/modules/user/schemas/user-profile.schema';
import { TastePreference, RegionalCuisine, DietaryRestriction, CookingSkill, BudgetLevel } from '../src/modules/user/schemas/user-preferences.schema';

describe('User Profile Flow (e2e)', () => {
    let app: INestApplication;
    let jwtToken: string;
    let userId: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    describe('Complete User Journey', () => {
        const testUser = {
            email: 'testflow@example.com',
            username: 'testflow',
            password: 'password123',
            firstName: '测试',
            lastName: '用户',
            gender: 'male',
            birthYear: 1990,
        };

        const testProfile = {
            gender: 'male',
            age: 30,
            height: 175,
            weight: 70,
            activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            sleepSchedule: {
                bedtime: '23:00',
                wakeTime: '07:00',
                averageHours: 8,
            },
            healthConditions: [HealthCondition.NONE],
            allergies: ['花生'],
            mainGoal: HealthGoal.WEIGHT_LOSS,
            targetWeight: 65,
            goalTimeline: 12,
        };

        const testPreferences = {
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
        };

        it('1. Should register a new user', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/auth/register')
                .send(testUser)
                .expect(201);

            expect(response.body).toHaveProperty('statusCode', 201);
            expect(response.body).toHaveProperty('message');
            expect(response.body.data).toHaveProperty('user');
            expect(response.body.data).toHaveProperty('accessToken');
            expect(response.body.data.user.email).toBe(testUser.email);

            jwtToken = response.body.data.accessToken;
            userId = response.body.data.user._id;
        });

        it('2. Should check profile status (should not exist initially)', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/users/profile/status')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(response.body.data.hasProfile).toBe(false);
        });

        it('3. Should create user profile during onboarding', async () => {
            const response = await supertest(app.getHttpServer())
                .post('/users/profile/onboarding')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(testProfile)
                .expect(201);

            expect(response.body).toHaveProperty('statusCode', 201);
            expect(response.body.data).toHaveProperty('userId', userId);
            expect(response.body.data).toHaveProperty('bmi');
            expect(response.body.data).toHaveProperty('bmiCategory');
            expect(response.body.data).toHaveProperty('bmr');
            expect(response.body.data).toHaveProperty('tdee');
            expect(response.body.data).toHaveProperty('dailyCalories');
            expect(response.body.data).toHaveProperty('macros');

            // Verify calculated values
            expect(response.body.data.bmi).toBeCloseTo(22.86, 1);
            expect(response.body.data.bmiCategory).toBe('normal');
            expect(response.body.data.bmr).toBeGreaterThan(1500);
            expect(response.body.data.tdee).toBeGreaterThan(response.body.data.bmr);
            expect(response.body.data.macros).toHaveProperty('protein');
            expect(response.body.data.macros).toHaveProperty('carbohydrates');
            expect(response.body.data.macros).toHaveProperty('fat');
        });

        it('4. Should not allow creating profile again', async () => {
            await supertest(app.getHttpServer())
                .post('/users/profile/onboarding')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(testProfile)
                .expect(409); // Conflict
        });

        it('5. Should check profile status (should exist now)', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/users/profile/status')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(response.body.data.hasProfile).toBe(true);
        });

        it('6. Should create user preferences', async () => {
            const response = await supertest(app.getHttpServer())
                .put('/users/profile/preferences')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(testPreferences)
                .expect(201);

            expect(response.body).toHaveProperty('statusCode', 201);
            expect(response.body.data).toHaveProperty('userId', userId);
            expect(response.body.data.tastePreferences).toEqual(testPreferences.tastePreferences);
            expect(response.body.data.regionalHabits).toEqual(testPreferences.regionalHabits);
            expect(response.body.data.dietaryRestrictions).toEqual(testPreferences.dietaryRestrictions);
            expect(response.body.data.mealTiming).toEqual(testPreferences.mealTiming);
            expect(response.body.data.nutritionFocus).toEqual(testPreferences.nutritionFocus);
        });

        it('7. Should get complete user profile with calculations', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('userId', userId);
            expect(response.body.data).toHaveProperty('mainGoal', testProfile.mainGoal);
            expect(response.body.data).toHaveProperty('bmi');
            expect(response.body.data).toHaveProperty('bmr');
            expect(response.body.data).toHaveProperty('tdee');
            expect(response.body.data).toHaveProperty('dailyCalories');
            expect(response.body.data).toHaveProperty('macros');

            // For weight loss goal, daily calories should be 80% of TDEE
            const expectedCalories = Math.round(response.body.data.tdee * 0.8);
            expect(response.body.data.dailyCalories).toBe(expectedCalories);
        });

        it('8. Should get user preferences', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/users/profile/preferences')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(response.body.data).toHaveProperty('userId', userId);
            expect(response.body.data.tastePreferences).toEqual(testPreferences.tastePreferences);
            expect(response.body.data.favoriteIngredients).toEqual(testPreferences.favoriteIngredients);
            expect(response.body.data.dislikedIngredients).toEqual(testPreferences.dislikedIngredients);
        });

        it('9. Should update user preferences', async () => {
            const updatedPreferences = {
                cookingTimePreference: 45,
                budgetPerMeal: BudgetLevel.HIGH,
            };

            const response = await supertest(app.getHttpServer())
                .put('/users/profile/preferences')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(updatedPreferences)
                .expect(200);

            expect(response.body.data.cookingTimePreference).toBe(45);
            expect(response.body.data.budgetPerMeal).toBe(BudgetLevel.HIGH);
            // Other preferences should remain unchanged
            expect(response.body.data.tastePreferences).toEqual(testPreferences.tastePreferences);
        });

        it('10. Should update user profile weight and recalculate metrics', async () => {
            const weightUpdate = { weight: 68 };

            const response = await supertest(app.getHttpServer())
                .put('/users/profile')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(weightUpdate)
                .expect(200);

            expect(response.body.data.weight).toBe(68);
        });

        it('11. Should verify metrics recalculation after weight update', async () => {
            const response = await supertest(app.getHttpServer())
                .get('/users/profile')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            // BMI should be recalculated based on new weight
            const expectedBMI = 68 / ((175 / 100) ** 2);
            expect(response.body.data.bmi).toBeCloseTo(expectedBMI, 1);
            expect(response.body.data.weight).toBe(68);
        });

        it('12. Should manage ingredient preferences', async () => {
            // Add favorite ingredient
            const addFavoriteResponse = await supertest(app.getHttpServer())
                .post('/users/profile/preferences/ingredients/favorites/豆腐')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(addFavoriteResponse.body.data.favoriteIngredients).toContain('豆腐');

            // Add disliked ingredient
            const addDislikedResponse = await supertest(app.getHttpServer())
                .post('/users/profile/preferences/ingredients/dislikes/芹菜')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(addDislikedResponse.body.data.dislikedIngredients).toContain('芹菜');

            // Remove ingredient preference
            const removeResponse = await supertest(app.getHttpServer())
                .delete('/users/profile/preferences/ingredients/香菜')
                .set('Authorization', `Bearer ${jwtToken}`)
                .expect(200);

            expect(removeResponse.body.data.dislikedIngredients).not.toContain('香菜');
        });

        it('13. Should update meal timing', async () => {
            const newMealTiming = {
                breakfast: '08:30',
                lunch: '12:30',
                dinner: '18:30',
            };

            const response = await supertest(app.getHttpServer())
                .put('/users/profile/preferences/meal-timing')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(newMealTiming)
                .expect(200);

            expect(response.body.data.mealTiming.breakfast).toBe('08:30');
            expect(response.body.data.mealTiming.lunch).toBe('12:30');
            expect(response.body.data.mealTiming.dinner).toBe('18:30');
        });

        it('14. Should update nutrition focus', async () => {
            const newNutritionFocus = {
                prioritizeProtein: false,
                limitSodium: true,
                increaseFiber: true,
                limitSugar: false,
                focusOnVitamins: ['vitamin_d', 'calcium'],
            };

            const response = await supertest(app.getHttpServer())
                .put('/users/profile/preferences/nutrition-focus')
                .set('Authorization', `Bearer ${jwtToken}`)
                .send(newNutritionFocus)
                .expect(200);

            expect(response.body.data.nutritionFocus).toEqual(newNutritionFocus);
        });

        it('15. Should validate complete user data consistency', async () => {
            // Get final state of profile and preferences
            const [profileResponse, preferencesResponse] = await Promise.all([
                supertest(app.getHttpServer())
                    .get('/users/profile')
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .expect(200),
                supertest(app.getHttpServer())
                    .get('/users/profile/preferences')
                    .set('Authorization', `Bearer ${jwtToken}`)
                    .expect(200),
            ]);

            const profile = profileResponse.body.data;
            const preferences = preferencesResponse.body.data;

            // Verify data consistency
            expect(profile.userId).toBe(preferences.userId);
            expect(profile.weight).toBe(68); // Updated weight
            expect(preferences.cookingTimePreference).toBe(45); // Updated cooking time
            expect(preferences.budgetPerMeal).toBe(BudgetLevel.HIGH); // Updated budget
            expect(preferences.favoriteIngredients).toContain('豆腐'); // Added favorite
            expect(preferences.dislikedIngredients).toContain('芹菜'); // Added dislike
            expect(preferences.dislikedIngredients).not.toContain('香菜'); // Removed ingredient

            // Verify calculated metrics are reasonable
            expect(profile.bmi).toBeGreaterThan(15);
            expect(profile.bmi).toBeLessThan(40);
            expect(profile.bmr).toBeGreaterThan(1000);
            expect(profile.bmr).toBeLessThan(3000);
            expect(profile.tdee).toBeGreaterThan(profile.bmr);
            expect(profile.dailyCalories).toBeGreaterThan(1000);
            expect(profile.macros.protein).toBeGreaterThan(0);
            expect(profile.macros.carbohydrates).toBeGreaterThan(0);
            expect(profile.macros.fat).toBeGreaterThan(0);
        });
    });

    describe('Error Handling and Edge Cases', () => {
        it('Should handle unauthorized access', async () => {
            await supertest(app.getHttpServer())
                .get('/users/profile')
                .expect(401);

            await supertest(app.getHttpServer())
                .post('/users/profile/onboarding')
                .send({})
                .expect(401);
        });

        it('Should validate profile data', async () => {
            // Create another user for validation tests
            const invalidUser = {
                email: 'invalid@example.com',
                username: 'invalid',
                password: 'password123',
                firstName: 'Invalid',
                lastName: 'User',
                gender: 'male',
                birthYear: 1995,
            };

            const registerResponse = await supertest(app.getHttpServer())
                .post('/auth/register')
                .send(invalidUser)
                .expect(201);

            const invalidToken = registerResponse.body.data.accessToken;

            // Test invalid profile data
            const invalidProfile = {
                gender: 'invalid',
                age: -5,
                height: 50,
                weight: 300,
                activityLevel: 'invalid_level',
                mainGoal: 'invalid_goal',
            };

            await supertest(app.getHttpServer())
                .post('/users/profile/onboarding')
                .set('Authorization', `Bearer ${invalidToken}`)
                .send(invalidProfile)
                .expect(400);
        });

        it('Should validate preferences data', async () => {
            const invalidUser = {
                email: 'invalid2@example.com',
                username: 'invalid2',
                password: 'password123',
                firstName: 'Invalid2',
                lastName: 'User',
                gender: 'female',
                birthYear: 1995,
            };

            const registerResponse = await supertest(app.getHttpServer())
                .post('/auth/register')
                .send(invalidUser)
                .expect(201);

            const invalidToken = registerResponse.body.data.accessToken;

            const invalidPreferences = {
                cookingTimePreference: 200, // Too high
                mealTiming: {
                    breakfast: '25:00', // Invalid time
                    lunch: 'invalid',
                    dinner: '18:00',
                },
            };

            await supertest(app.getHttpServer())
                .put('/users/profile/preferences')
                .set('Authorization', `Bearer ${invalidToken}`)
                .send(invalidPreferences)
                .expect(400);
        });
    });
}); 