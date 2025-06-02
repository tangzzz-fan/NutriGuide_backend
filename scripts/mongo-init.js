// MongoDB initialization script for NutriGuide
// This script creates indexes and initial data for different environments

const dbName = process.env.MONGO_INITDB_DATABASE || 'nutriguide';
const env = process.env.NODE_ENV || 'development';

print(`Initializing MongoDB for ${dbName} in ${env} environment`);

// Connect to the database
db = db.getSiblingDB(dbName);

// Create collections with indexes
print('Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ createdAt: 1 });

// Foods collection
db.createCollection('foods');
db.foods.createIndex({ name: 1 });
db.foods.createIndex({ barcode: 1 }, { unique: true, sparse: true });
db.foods.createIndex({ category: 1 });
db.foods.createIndex({ brand: 1 });
db.foods.createIndex({ createdAt: 1 });

// Nutrition Plans collection
db.createCollection('nutritionplans');
db.nutritionplans.createIndex({ userId: 1 });
db.nutritionplans.createIndex({ createdAt: 1 });
db.nutritionplans.createIndex({ isActive: 1 });

// User Profiles collection
db.createCollection('userprofiles');
db.userprofiles.createIndex({ userId: 1 }, { unique: true });
db.userprofiles.createIndex({ createdAt: 1 });

// Meal Records collection
db.createCollection('mealrecords');
db.mealrecords.createIndex({ userId: 1 });
db.mealrecords.createIndex({ date: 1 });
db.mealrecords.createIndex({ mealType: 1 });
db.mealrecords.createIndex({ createdAt: 1 });

print('Database initialization completed successfully!');

// Insert sample data for development environment
if (env === 'development') {
    print('Inserting sample data for development...');

    // Sample foods
    db.foods.insertMany([
        {
            name: 'Apple',
            category: 'Fruits',
            nutritionPer100g: {
                calories: 52,
                protein: 0.3,
                carbohydrates: 14,
                fat: 0.2,
                fiber: 2.4,
                sugar: 10.4
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Chicken Breast',
            category: 'Protein',
            nutritionPer100g: {
                calories: 165,
                protein: 31,
                carbohydrates: 0,
                fat: 3.6,
                fiber: 0,
                sugar: 0
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            name: 'Brown Rice',
            category: 'Grains',
            nutritionPer100g: {
                calories: 111,
                protein: 2.6,
                carbohydrates: 23,
                fat: 0.9,
                fiber: 1.8,
                sugar: 0.4
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ]);

    print('Sample data inserted successfully!');
}

print(`MongoDB initialization for ${dbName} completed!`); 