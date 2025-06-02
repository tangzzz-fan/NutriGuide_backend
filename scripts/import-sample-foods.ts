import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { FoodService } from '../src/modules/food/food.service';
import * as sampleFoods from '../src/modules/food/data/sample-foods.json';

async function importSampleFoods() {
    console.log('🚀 Starting food data import...');

    const app = await NestFactory.createApplicationContext(AppModule);
    const foodService = app.get(FoodService);

    try {
        console.log(`📦 Importing ${sampleFoods.length} sample foods...`);

        const createdFoods = await foodService.bulkCreate(sampleFoods);

        console.log(`✅ Successfully imported ${createdFoods.length} foods`);
        console.log('📊 Food categories:');

        const categories = await foodService.getCategoriesWithCounts();
        Object.entries(categories).forEach(([category, count]) => {
            console.log(`   - ${category}: ${count} items`);
        });

    } catch (error) {
        console.error('❌ Error importing foods:', error.message);
    } finally {
        await app.close();
    }
}

// Run the import if this script is executed directly
if (require.main === module) {
    importSampleFoods()
        .then(() => {
            console.log('🎉 Import completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Import failed:', error);
            process.exit(1);
        });
}

export { importSampleFoods }; 