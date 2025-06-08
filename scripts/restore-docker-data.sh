#!/bin/bash

# Docker MongoDB data restoration script
set -e

ENV=${1:-development}
CONTAINER_NAME="nutriguide-mongodb-dev"
MONGO_USER="admin"
MONGO_PASS="admin123"
AUTH_DB="admin"

# Set database name based on environment
case "$ENV" in
    "qa")
        DB_NAME="nutriguide_qa"
        ;;
    "production" | "prod")
        DB_NAME="nutriguide_prod"
        ;;
    *)
        DB_NAME="nutriguide_dev"
        ;;
esac

BACKUP_DIR="../backup_database/database_export_files"

echo "🔄 Restoring data to Docker MongoDB for environment: $ENV"
echo "📍 Container: $CONTAINER_NAME"
echo "📍 Database: $DB_NAME"

# Test Docker container connection
echo "Testing Docker MongoDB connection..."
if ! docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB --eval "db.runCommand('ping')" >/dev/null 2>&1; then
    echo "❌ Cannot connect to Docker MongoDB container: $CONTAINER_NAME"
    echo "ℹ️  Make sure Docker containers are running with: docker-compose -f docker-compose.dev.yml up -d"
    exit 1
fi
echo "✅ Docker MongoDB connection successful"

# Clear existing database
echo "🧹 Clearing existing database: $DB_NAME..."
docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB $DB_NAME --eval "db.dropDatabase()" >/dev/null
echo "✅ Database cleared"

# Restore collections
echo "📦 Restoring collections to Docker MongoDB..."
cd "$BACKUP_DIR"

# Process each .gz file
for file in *.json.gz; do
    if [ -f "$file" ]; then
        collection_name=$(basename "$file" .json.gz)
        echo "Restoring $collection_name..."
        
        # Decompress to temporary file
        temp_file=$(mktemp)
        gunzip -c "$file" > "$temp_file"
        
        # Copy temp file to container and import
        docker cp "$temp_file" $CONTAINER_NAME:/tmp/restore_data.json
        
        docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB $DB_NAME --eval "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('/tmp/restore_data.json', 'utf8'));
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
        "
        
        # Clean up
        rm -f "$temp_file"
        docker exec $CONTAINER_NAME rm -f /tmp/restore_data.json
    fi
done

# Clear user data for non-development environments
if [ "$ENV" != "development" ]; then
    echo "🧹 Clearing user data for $ENV environment..."
    docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB $DB_NAME --eval "
        db.users.deleteMany({});
        db.authtokens.deleteMany({});
        print('✅ User data cleared');
    "
fi

# Create indexes
echo "🔍 Creating indexes..."
docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB $DB_NAME --eval "
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
"

# Also create QA and PROD databases if restoring dev
if [ "$ENV" = "development" ]; then
    echo "🔄 Creating QA and PROD databases..."
    
    # Create QA database
    echo "Creating nutriguide_qa database..."
    cd "$BACKUP_DIR"
    for file in *.json.gz; do
        if [ -f "$file" ]; then
            collection_name=$(basename "$file" .json.gz)
            temp_file=$(mktemp)
            gunzip -c "$file" > "$temp_file"
            docker cp "$temp_file" $CONTAINER_NAME:/tmp/restore_data.json
            
            docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB nutriguide_qa --eval "
                const fs = require('fs');
                const data = JSON.parse(fs.readFileSync('/tmp/restore_data.json', 'utf8'));
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
                }
            " >/dev/null
            
            rm -f "$temp_file"
            docker exec $CONTAINER_NAME rm -f /tmp/restore_data.json
        fi
    done
    
    # Clear QA user data
    docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB nutriguide_qa --eval "
        db.users.deleteMany({});
        db.authtokens.deleteMany({});
    " >/dev/null
    
    # Create PROD database (copy from QA)
    echo "Creating nutriguide_prod database..."
    docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB --eval "
        const sourceDb = db.getSiblingDB('nutriguide_qa');
        const targetDb = db.getSiblingDB('nutriguide_prod');
        
        sourceDb.getCollectionNames().forEach(function(collectionName) {
            const docs = sourceDb[collectionName].find().toArray();
            if (docs.length > 0) {
                targetDb[collectionName].insertMany(docs);
            }
        });
    " >/dev/null
    
    echo "✅ Created QA and PROD databases"
fi

# Verify restoration
echo "🔍 Verifying restoration..."
docker exec $CONTAINER_NAME mongosh -u $MONGO_USER -p $MONGO_PASS --authenticationDatabase $AUTH_DB $DB_NAME --eval "
    const collections = db.getCollectionNames();
    let totalDocs = 0;
    collections.forEach(function(collName) {
        const count = db[collName].countDocuments();
        totalDocs += count;
    });
    
    print('📊 Collections: ' + collections.length);
    print('📊 Total documents: ' + totalDocs);
"

echo "🎉 Docker MongoDB restoration completed for $ENV environment!"
echo "🌐 You can now access MongoDB Admin at: http://localhost:8081" 