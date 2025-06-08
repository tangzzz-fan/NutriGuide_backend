#!/bin/bash

# Collection name normalization script
# Converts all collection names to snake_case format

set -e

ENV=${1:-development}
DB_URI=${2:-"mongodb://localhost:27017"}

# Set database name based on environment
case "$ENV" in
    "qa")
        DB_NAME="nutriguide_qa"
        ;;
    "production" | "prod")
        DB_NAME="nutriguide_prod"
        ;;
    *)
        DB_NAME="nutriguide"
        ;;
esac

FULL_URI="$DB_URI/$DB_NAME"

echo "🔄 Normalizing collection names for environment: $ENV"
echo "📍 Database: $DB_NAME"

# Define collection name mappings (old_name:new_name)
collection_mappings="
DietaryPrinciples:dietary_principles
DietaryRecommendations:dietary_recommendations
FoodCategoryAdvice:food_category_advice
FoodChoicesGuide:food_choices_guide
FoodExchangeItems:food_exchange_items
FoodMedicineSubstances:food_medicine_substances
GuideIntroduction:guide_introduction
ObesityStandards:obesity_standards_new
ReferenceTables:reference_tables
RegionalFoodAvailability:regional_food_availability
SampleMealPlans:sample_meal_plans
SeasonalMealPlans:seasonal_meal_plans
StructuredMealPlans:structured_meal_plans
TcmDietaryRecipes:tcm_dietary_recipes_new
TcmObesitySyndromes:tcm_obesity_syndromes
"

echo "📋 Collection name mappings:"
echo "$collection_mappings" | grep -v '^$' | while read mapping; do
    old_name=$(echo "$mapping" | cut -d: -f1)
    new_name=$(echo "$mapping" | cut -d: -f2)
    echo "  $old_name -> $new_name"
done

# Check if collections exist and rename them
echo "🔄 Renaming collections..."
echo "$collection_mappings" | grep -v '^$' | while read mapping; do
    old_name=$(echo "$mapping" | cut -d: -f1)
    new_name=$(echo "$mapping" | cut -d: -f2)
    
    # Check if old collection exists
    exists=$(mongosh --quiet --eval "
        const collections = db.getCollectionNames();
        print(collections.includes('$old_name') ? 'true' : 'false');
    " "$FULL_URI")
    
    if [ "$exists" = "true" ]; then
        echo "Renaming $old_name to $new_name..."
        
        # Rename collection
        mongosh --quiet --eval "
            try {
                db.$old_name.renameCollection('$new_name');
                print('✅ Renamed $old_name to $new_name');
            } catch (e) {
                print('❌ Failed to rename $old_name: ' + e.message);
            }
        " "$FULL_URI"
    else
        echo "⏭️  Collection $old_name does not exist, skipping..."
    fi
done

# Handle duplicate obesity_standards
echo "🔄 Handling duplicate obesity_standards..."
mongosh --quiet --eval "
    const collections = db.getCollectionNames();
    
    if (collections.includes('obesity_standards') && collections.includes('obesity_standards_new')) {
        // Merge the collections
        const oldDocs = db.obesity_standards.find().toArray();
        const newDocs = db.obesity_standards_new.find().toArray();
        
        // Drop both collections
        db.obesity_standards.drop();
        db.obesity_standards_new.drop();
        
        // Create new collection with merged data
        const allDocs = [...oldDocs, ...newDocs];
        if (allDocs.length > 0) {
            db.obesity_standards.insertMany(allDocs);
            print('✅ Merged obesity_standards collections');
        }
    } else if (collections.includes('obesity_standards_new')) {
        db.obesity_standards_new.renameCollection('obesity_standards');
        print('✅ Renamed obesity_standards_new to obesity_standards');
    }
" "$FULL_URI"

# Handle duplicate tcm_dietary_recipes
echo "🔄 Handling duplicate tcm_dietary_recipes..."
mongosh --quiet --eval "
    const collections = db.getCollectionNames();
    
    if (collections.includes('tcm_dietary_recipes') && collections.includes('tcm_dietary_recipes_new')) {
        // Merge the collections
        const oldDocs = db.tcm_dietary_recipes.find().toArray();
        const newDocs = db.tcm_dietary_recipes_new.find().toArray();
        
        // Drop both collections
        db.tcm_dietary_recipes.drop();
        db.tcm_dietary_recipes_new.drop();
        
        // Create new collection with merged data
        const allDocs = [...oldDocs, ...newDocs];
        if (allDocs.length > 0) {
            db.tcm_dietary_recipes.insertMany(allDocs);
            print('✅ Merged tcm_dietary_recipes collections');
        }
    } else if (collections.includes('tcm_dietary_recipes_new')) {
        db.tcm_dietary_recipes_new.renameCollection('tcm_dietary_recipes');
        print('✅ Renamed tcm_dietary_recipes_new to tcm_dietary_recipes');
    }
" "$FULL_URI"

# Verify final collection names
echo "🔍 Final collection names:"
mongosh --quiet --eval "
    const collections = db.getCollectionNames().sort();
    collections.forEach(name => {
        const count = db[name].countDocuments();
        print('  ' + name + ' (' + count + ' documents)');
    });
" "$FULL_URI"

echo "✅ Collection name normalization completed!" 