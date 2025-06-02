import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Model, Document, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { AppModule } from '../src/app.module';
import { User, UserDocument } from '../src/modules/user/schemas/user.schema';
import { UserProfile, UserProfileDocument, ActivityLevel, HealthGoal, HealthCondition } from '../src/modules/user/schemas/user-profile.schema';
import { UserPreferences, UserPreferencesDocument, TastePreference, RegionalCuisine, DietaryRestriction, CookingSkill, BudgetLevel } from '../src/modules/user/schemas/user-preferences.schema';
import { Food } from '../src/modules/food/schemas/food.schema';
import sampleFoods from '../src/modules/food/data/sample-foods.json';

/**
 * Database seeding script
 * This script populates the database with initial test data
 */
async function seedDatabase() {
    console.log('🌱 Starting database seeding...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const userModel = app.get<Model<UserDocument>>(getModelToken(User.name));
    const userProfileModel = app.get<Model<UserProfileDocument>>(getModelToken(UserProfile.name));
    const userPreferencesModel = app.get<Model<UserPreferencesDocument>>(getModelToken(UserPreferences.name));
    const foodModel = app.get<Model<Food>>(getModelToken(Food.name));

    try {
        // Check if seeding is allowed
        const env = configService.get('env.NODE_ENV');
        if (env === 'production') {
            console.log('❌ Seeding is not allowed in production environment');
            process.exit(1);
        }

        console.log(`🌍 Environment: ${env}`);

        // Clear existing data (optional - comment out if you want to keep existing data)
        const clearData = process.argv.includes('--clear');
        if (clearData) {
            console.log('🧹 Clearing existing data...');
            await userModel.deleteMany({});
            await userProfileModel.deleteMany({});
            await userPreferencesModel.deleteMany({});
            await foodModel.deleteMany({});
            console.log('✅ Existing data cleared');
        }

        // Seed users
        const createdUsers = await seedUsers(userModel);

        // Seed user profiles
        await seedUserProfiles(userProfileModel, createdUsers);

        // Seed user preferences
        await seedUserPreferences(userPreferencesModel, createdUsers);

        // Seed foods
        await seedFoods(foodModel);

        console.log('🎉 Database seeding completed successfully!');
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    } finally {
        await app.close();
    }
}

/**
 * Seed test users
 */
async function seedUsers(userModel: Model<UserDocument>): Promise<UserDocument[]> {
    console.log('👥 Seeding users...');

    const saltRounds = 10;
    const testUsers = [
        {
            email: 'admin@nutriguide.com',
            username: 'admin',
            password: await bcrypt.hash('password123', saltRounds),
            firstName: '管理员',
            lastName: '用户',
            gender: 'male',
            birthYear: 1990,
            phone: '13800138000',
            isActive: true,
            isEmailVerified: true,
        },
        {
            email: 'john.doe@example.com',
            username: 'johndoe',
            password: await bcrypt.hash('password123', saltRounds),
            firstName: 'John',
            lastName: 'Doe',
            gender: 'male',
            birthYear: 1985,
            phone: '13800138001',
            isActive: true,
            isEmailVerified: true,
        },
        {
            email: 'jane.smith@example.com',
            username: 'janesmith',
            password: await bcrypt.hash('password123', saltRounds),
            firstName: 'Jane',
            lastName: 'Smith',
            gender: 'female',
            birthYear: 1992,
            phone: '13800138002',
            isActive: true,
            isEmailVerified: true,
        },
        {
            email: 'test.user@example.com',
            username: 'testuser',
            password: await bcrypt.hash('password123', saltRounds),
            firstName: '测试',
            lastName: '用户',
            gender: 'other',
            birthYear: 1995,
            isActive: true,
            isEmailVerified: false,
        },
    ];

    const createdUsers: UserDocument[] = [];

    for (const userData of testUsers) {
        const existingUser = await userModel.findOne({
            $or: [{ email: userData.email }, { username: userData.username }]
        });

        if (!existingUser) {
            const user = new userModel(userData);
            const savedUser = await user.save();
            createdUsers.push(savedUser);
            console.log(`✅ Created user: ${userData.email}`);
        } else {
            createdUsers.push(existingUser);
            console.log(`⚠️  User already exists: ${userData.email}`);
        }
    }

    console.log(`📊 Users seeding completed`);
    return createdUsers;
}

/**
 * Seed user profiles
 */
async function seedUserProfiles(userProfileModel: Model<UserProfileDocument>, users: UserDocument[]): Promise<void> {
    console.log('📋 Seeding user profiles...');

    const profilesData = [
        {
            userId: users[0]._id,
            gender: 'male',
            age: 34,
            height: 175,
            weight: 75,
            activityLevel: ActivityLevel.MODERATELY_ACTIVE,
            sleepSchedule: {
                bedtime: '23:00',
                wakeTime: '07:00',
                averageHours: 8,
            },
            healthConditions: [HealthCondition.NONE],
            allergies: [],
            mainGoal: HealthGoal.WEIGHT_MAINTAIN,
            targetWeight: 75,
            goalTimeline: 12,
        },
        {
            userId: users[1]._id,
            gender: 'male',
            age: 39,
            height: 180,
            weight: 85,
            activityLevel: ActivityLevel.VERY_ACTIVE,
            sleepSchedule: {
                bedtime: '22:30',
                wakeTime: '06:30',
                averageHours: 8,
            },
            healthConditions: [HealthCondition.NONE],
            allergies: ['花生'],
            mainGoal: HealthGoal.MUSCLE_GAIN,
            targetWeight: 90,
            goalTimeline: 16,
        },
        {
            userId: users[2]._id,
            gender: 'female',
            age: 32,
            height: 165,
            weight: 60,
            activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
            sleepSchedule: {
                bedtime: '23:30',
                wakeTime: '07:30',
                averageHours: 8,
            },
            healthConditions: [HealthCondition.NONE],
            allergies: ['海鲜', '乳制品'],
            mainGoal: HealthGoal.WEIGHT_LOSS,
            targetWeight: 55,
            goalTimeline: 8,
        },
        {
            userId: users[3]._id,
            gender: 'other',
            age: 29,
            height: 170,
            weight: 70,
            activityLevel: ActivityLevel.SEDENTARY,
            healthConditions: [HealthCondition.DIABETES],
            allergies: [],
            mainGoal: HealthGoal.IMPROVE_HEALTH,
            targetWeight: 65,
            goalTimeline: 20,
        },
    ];

    for (const profileData of profilesData) {
        const existingProfile = await userProfileModel.findOne({ userId: profileData.userId });

        if (!existingProfile) {
            const profile = new userProfileModel(profileData);
            await profile.save();
            console.log(`✅ Created profile for user: ${profileData.userId}`);
        } else {
            console.log(`⚠️  Profile already exists for user: ${profileData.userId}`);
        }
    }

    console.log(`📊 User profiles seeding completed`);
}

/**
 * Seed user preferences
 */
async function seedUserPreferences(userPreferencesModel: Model<UserPreferencesDocument>, users: UserDocument[]): Promise<void> {
    console.log('⚙️ Seeding user preferences...');

    const preferencesData = [
        {
            userId: users[0]._id,
            tastePreferences: [TastePreference.MILD, TastePreference.UMAMI],
            regionalHabits: [RegionalCuisine.CHINESE_NORTHERN, RegionalCuisine.WESTERN],
            dietaryRestrictions: [],
            cookingTimePreference: 45,
            cookingSkill: CookingSkill.INTERMEDIATE,
            budgetPerMeal: BudgetLevel.MEDIUM,
            dislikedIngredients: ['香菜'],
            favoriteIngredients: ['鸡肉', '西兰花', '大米'],
            mealTiming: {
                breakfast: '08:00',
                lunch: '12:00',
                dinner: '18:30',
                snacks: ['10:00', '15:00'],
            },
            nutritionFocus: {
                prioritizeProtein: true,
                limitSodium: false,
                increaseFiber: true,
                limitSugar: false,
                focusOnVitamins: ['vitamin_d', 'iron'],
            },
        },
        {
            userId: users[1]._id,
            tastePreferences: [TastePreference.SPICY, TastePreference.RICH],
            regionalHabits: [RegionalCuisine.SICHUAN, RegionalCuisine.HUNAN],
            dietaryRestrictions: [DietaryRestriction.NO_PORK],
            cookingTimePreference: 60,
            cookingSkill: CookingSkill.ADVANCED,
            budgetPerMeal: BudgetLevel.HIGH,
            dislikedIngredients: ['花生'],
            favoriteIngredients: ['牛肉', '鸡肉', '豆腐', '青椒'],
            mealTiming: {
                breakfast: '07:00',
                lunch: '12:30',
                dinner: '19:00',
                snacks: ['16:00'],
            },
            nutritionFocus: {
                prioritizeProtein: true,
                limitSodium: false,
                increaseFiber: false,
                limitSugar: true,
                focusOnVitamins: ['vitamin_b12', 'iron', 'zinc'],
            },
        },
        {
            userId: users[2]._id,
            tastePreferences: [TastePreference.SWEET, TastePreference.MILD],
            regionalHabits: [RegionalCuisine.CANTONESE, RegionalCuisine.JAPANESE],
            dietaryRestrictions: [DietaryRestriction.DAIRY_FREE, DietaryRestriction.NO_SEAFOOD],
            cookingTimePreference: 30,
            cookingSkill: CookingSkill.BEGINNER,
            budgetPerMeal: BudgetLevel.MEDIUM,
            dislikedIngredients: ['海鲜', '牛奶', '芝士'],
            favoriteIngredients: ['蔬菜', '水果', '豆制品'],
            mealTiming: {
                breakfast: '08:30',
                lunch: '13:00',
                dinner: '18:00',
                snacks: ['10:30', '15:30'],
            },
            nutritionFocus: {
                prioritizeProtein: false,
                limitSodium: true,
                increaseFiber: true,
                limitSugar: true,
                focusOnVitamins: ['vitamin_c', 'calcium', 'vitamin_d'],
            },
        },
        {
            userId: users[3]._id,
            tastePreferences: [TastePreference.BITTER, TastePreference.SOUR],
            regionalHabits: [RegionalCuisine.MEDITERRANEAN, RegionalCuisine.WESTERN],
            dietaryRestrictions: [DietaryRestriction.LOW_CARB, DietaryRestriction.GLUTEN_FREE],
            cookingTimePreference: 25,
            cookingSkill: CookingSkill.BEGINNER,
            budgetPerMeal: BudgetLevel.LOW,
            dislikedIngredients: ['面粉', '糖'],
            favoriteIngredients: ['绿叶蔬菜', '鱼肉', '坚果'],
            mealTiming: {
                breakfast: '09:00',
                lunch: '13:30',
                dinner: '17:30',
            },
            nutritionFocus: {
                prioritizeProtein: true,
                limitSodium: true,
                increaseFiber: true,
                limitSugar: true,
                focusOnVitamins: ['vitamin_c', 'vitamin_e', 'omega_3'],
            },
        },
    ];

    for (const preferencesDataItem of preferencesData) {
        const existingPreferences = await userPreferencesModel.findOne({ userId: preferencesDataItem.userId });

        if (!existingPreferences) {
            const preferences = new userPreferencesModel(preferencesDataItem);
            await preferences.save();
            console.log(`✅ Created preferences for user: ${preferencesDataItem.userId}`);
        } else {
            console.log(`⚠️  Preferences already exist for user: ${preferencesDataItem.userId}`);
        }
    }

    console.log(`📊 User preferences seeding completed`);
}

/**
 * Seed foods data
 */
async function seedFoods(foodModel: Model<Food>) {
    console.log('🍎 Seeding foods...');

    // Add timestamp and verification status to sample foods
    const foodsToSeed = sampleFoods.map(food => ({
        ...food,
        isActive: true,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    }));

    // Additional foods for more variety
    const additionalFoods = [
        {
            name: '牛奶',
            nameEn: 'Milk',
            description: '全脂牛奶，富含蛋白质和钙质',
            category: 'dairy',
            subcategories: ['全脂奶制品'],
            nutrition: {
                calories: 42,
                protein: 3.4,
                carbohydrates: 5,
                fat: 1,
                fiber: 0,
                sugar: 5,
                sodium: 44,
                potassium: 150,
                calcium: 113,
            },
            commonUnits: ['毫升', '杯', '盒'],
            allergens: ['乳制品'],
            dietaryTags: ['素食'],
            dataSource: 'manual',
            isActive: true,
            isVerified: true,
        },
        {
            name: '鸡蛋',
            nameEn: 'Egg',
            description: '新鲜鸡蛋，优质蛋白质来源',
            category: 'meat',
            subcategories: ['禽蛋类'],
            nutrition: {
                calories: 155,
                protein: 13,
                carbohydrates: 1.1,
                fat: 11,
                fiber: 0,
                sugar: 1.1,
                sodium: 124,
                potassium: 138,
                iron: 1.8,
            },
            commonUnits: ['个', '只'],
            allergens: ['蛋类'],
            dietaryTags: ['高蛋白'],
            dataSource: 'manual',
            isActive: true,
            isVerified: true,
        },
        {
            name: '三文鱼',
            nameEn: 'Salmon',
            description: '新鲜三文鱼，富含Omega-3脂肪酸',
            category: 'seafood',
            subcategories: ['深海鱼类'],
            nutrition: {
                calories: 208,
                protein: 20,
                carbohydrates: 0,
                fat: 13,
                fiber: 0,
                sugar: 0,
                sodium: 59,
                potassium: 363,
                iron: 0.8,
            },
            commonUnits: ['克', '片', '块'],
            allergens: ['鱼类'],
            dietaryTags: ['高蛋白', '富含Omega-3'],
            dataSource: 'manual',
            isActive: true,
            isVerified: true,
        },
    ];

    const allFoods = [...foodsToSeed, ...additionalFoods];

    for (const foodData of allFoods) {
        const existingFood = await foodModel.findOne({ name: foodData.name });

        if (!existingFood) {
            const food = new foodModel(foodData);
            await food.save();
            console.log(`✅ Created food: ${foodData.name}`);
        } else {
            console.log(`⚠️  Food already exists: ${foodData.name}`);
        }
    }

    console.log(`📊 Foods seeding completed`);
}

// Run the seeding script
if (require.main === module) {
    seedDatabase();
}

export { seedDatabase }; 