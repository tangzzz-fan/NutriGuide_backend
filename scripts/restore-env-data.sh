#!/bin/bash

# Simple environment data restoration script
set -e

# Get parameters
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
BACKUP_DIR="../backup_database/database_export_files"

echo "🔄 Restoring data for environment: $ENV"
echo "📍 Database: $DB_NAME"
echo "🔗 URI: $FULL_URI"

# Test connection
echo "Testing MongoDB connection..."
if ! mongosh --eval "db.runCommand('ping')" "$FULL_URI" >/dev/null 2>&1; then
    echo "❌ Cannot connect to MongoDB at $FULL_URI"
    exit 1
fi
echo "✅ MongoDB connection successful"

# Clear existing database
echo "🧹 Clearing existing database..."
mongosh --eval "db.dropDatabase()" "$FULL_URI" >/dev/null
echo "✅ Database cleared"

# Restore collections
echo "📦 Restoring collections..."
cd "$BACKUP_DIR"

# Process each .gz file
for file in *.json.gz; do
    if [ -f "$file" ]; then
        collection_name=$(basename "$file" .json.gz)
        echo "Restoring $collection_name..."
        
        # Decompress to temporary file and import
        temp_file=$(mktemp)
        gunzip -c "$file" > "$temp_file"
        
        mongosh --quiet --eval "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('$temp_file', 'utf8'));
            let documents = data.documents || [];
            
            if (documents && documents.length > 0) {
                documents = documents.map(doc => {
                    if (doc._id) delete doc._id;
                    for (const key in doc) {
                        if (doc[key] && typeof doc[key] === 'object' && doc[key].\$date) {
                            doc[key] = new Date(doc[key].\$date);
                        }
                    }
                    return doc;
                });
                
                const result = db.$collection_name.insertMany(documents, { ordered: false });
                print('✅ Inserted ' + Object.keys(result.insertedIds).length + ' documents into $collection_name');
            }
        " "$FULL_URI"
        
        rm -f "$temp_file"
    fi
done

# Clear user data for non-development environments
if [ "$ENV" != "development" ]; then
    echo "🧹 Clearing user data for $ENV environment..."
    mongosh --eval "
        db.users.deleteMany({});
        db.authtokens.deleteMany({});
        print('✅ User data cleared');
    " "$FULL_URI"
fi

# Create indexes
echo "🔍 Creating indexes..."
mongosh --eval "
    try {
        db.users.createIndex({ email: 1 }, { unique: true });
        db.users.createIndex({ username: 1 }, { unique: true });
        db.users.createIndex({ isActive: 1 });
        print('✅ User indexes created');
    } catch (e) { print('User indexes skipped: ' + e.message); }
    
    try {
        db.meal_plans.createIndex({ name: 1 });
        db.meal_plans.createIndex({ category: 1 });
        print('✅ Meal plan indexes created');
    } catch (e) { print('Meal plan indexes skipped: ' + e.message); }
    
    try {
        db.authtokens.createIndex({ token: 1 }, { unique: true });
        db.authtokens.createIndex({ userId: 1 });
        db.authtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
        print('✅ Auth token indexes created');
    } catch (e) { print('Auth token indexes skipped: ' + e.message); }
" "$FULL_URI"

# Verify restoration
echo "🔍 Verifying restoration..."
mongosh --eval "
    const collections = db.getCollectionNames();
    let totalDocs = 0;
    collections.forEach(function(collName) {
        const count = db[collName].countDocuments();
        totalDocs += count;
    });
    
    print('📊 Collections: ' + collections.length);
    print('📊 Total documents: ' + totalDocs);
" "$FULL_URI"

echo "🎉 Database restoration completed for $ENV environment!" 