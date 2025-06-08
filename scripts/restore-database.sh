#!/bin/bash

# Database restoration script for NutriGuide
# This script cleans the current database and restores data from backup files

set -e  # Exit on any error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$(cd "$PROJECT_ROOT/../backup_database" && pwd)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if MongoDB is running
check_mongodb() {
    print_info "Checking MongoDB connection..."
    
    # Set database name based on environment first
    case "$NODE_ENV" in
        "qa")
            DB_NAME="nutriguide_qa"
            DEFAULT_URI="mongodb://localhost:27017/nutriguide_qa"
            ;;
        "production")
            DB_NAME="nutriguide_prod"
            DEFAULT_URI="mongodb://localhost:27017/nutriguide_prod"
            ;;
        *)
            DB_NAME="nutriguide"
            DEFAULT_URI="mongodb://localhost:27017/nutriguide"
            ;;
    esac
    
    # Get MongoDB URI from environment files (skip if file has syntax errors)
    if [ -f "$PROJECT_ROOT/.env.$NODE_ENV" ]; then
        # Try to source the file, but ignore errors
        source "$PROJECT_ROOT/.env.$NODE_ENV" 2>/dev/null || true
    elif [ -f "$PROJECT_ROOT/.env.development" ]; then
        source "$PROJECT_ROOT/.env.development" 2>/dev/null || true
    elif [ -f "$PROJECT_ROOT/.env" ]; then
        source "$PROJECT_ROOT/.env" 2>/dev/null || true
    fi
    
    # Use environment MONGODB_URI if set, otherwise use default
    MONGODB_URI=${MONGODB_URI:-$DEFAULT_URI}
    
    # Update DB_NAME if MONGODB_URI contains a database name
    if [[ "$MONGODB_URI" == *"/"* ]]; then
        EXTRACTED_DB_NAME=$(echo "$MONGODB_URI" | sed 's/.*\/\([^?]*\).*/\1/')
        if [ -n "$EXTRACTED_DB_NAME" ]; then
            DB_NAME="$EXTRACTED_DB_NAME"
        fi
    fi
    
    print_info "Using database: $DB_NAME"
    print_info "MongoDB URI: $MONGODB_URI"
    
    # Test MongoDB connection
    if ! mongosh --eval "db.runCommand('ping')" "$MONGODB_URI" >/dev/null 2>&1; then
        print_error "Cannot connect to MongoDB. Please ensure MongoDB is running."
        print_info "You can start MongoDB with: brew services start mongodb/brew/mongodb-community"
        exit 1
    fi
    
    print_success "MongoDB connection successful"
}

# Check if backup files exist
check_backup_files() {
    print_info "Checking backup files..."
    
    if [ ! -d "$BACKUP_DIR" ]; then
        print_error "Backup directory not found: $BACKUP_DIR"
        exit 1
    fi
    
    if [ ! -f "$BACKUP_DIR/database_export_files/export_metadata.json" ]; then
        print_error "Export metadata not found: $BACKUP_DIR/database_export_files/export_metadata.json"
        exit 1
    fi
    
    print_success "Backup files found"
}

# Clear existing database
clear_database() {
    print_info "Clearing existing database..."
    
    # Get all collection names and drop them
    collections=$(mongosh --quiet --eval "
        db.getMongo().getDBNames().forEach(function(dbName) {
            if (dbName === '$DB_NAME') {
                db = db.getSiblingDB(dbName);
                db.getCollectionNames().forEach(function(collName) {
                    print(collName);
                });
            }
        });
    " "$MONGODB_URI")
    
    if [ -n "$collections" ]; then
        echo "$collections" | while read -r collection; do
            if [ -n "$collection" ]; then
                mongosh --quiet --eval "db.$collection.drop()" "$MONGODB_URI"
                print_success "Dropped collection: $collection"
            fi
        done
    else
        print_info "No collections found to clear"
    fi
}

# Restore collections from backup files
restore_collections() {
    print_info "Restoring collections from backup files..."
    
    cd "$BACKUP_DIR/database_export_files"
    
    # Read metadata
    total_collections=$(jq -r '.export_info.total_collections' export_metadata.json)
    total_records=$(jq -r '.export_info.total_records' export_metadata.json)
    export_time=$(jq -r '.export_info.export_time' export_metadata.json)
    
    print_info "Backup info: $total_collections collections, $total_records records"
    print_info "Backup date: $export_time"
    
    restored_records=0
    
    # Process each collection
    jq -r '.collections | to_entries[] | @base64' export_metadata.json | while read -r entry; do
        collection_name=$(echo "$entry" | base64 --decode | jq -r '.key')
        filename=$(echo "$entry" | base64 --decode | jq -r '.value.filename')
        count=$(echo "$entry" | base64 --decode | jq -r '.value.count')
        
        if [ "$count" -eq 0 ]; then
            print_info "Skipping empty collection: $collection_name"
            continue
        fi
        
        if [ ! -f "$filename" ]; then
            print_warning "Backup file not found: $filename"
            continue
        fi
        
        print_info "Restoring collection: $collection_name ($count documents)"
        
        # Decompress and import data
        temp_file=$(mktemp)
        gunzip -c "$filename" > "$temp_file"
        
        if mongosh --quiet --eval "
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('$temp_file', 'utf8'));
            let documents = data.documents || [];
            
            if (!documents || documents.length === 0) {
                print('No documents to restore');
            } else {
                // Clean documents
                documents = documents.map(doc => {
                    // Remove _id field to let MongoDB generate new ones
                    if (doc._id) {
                        delete doc._id;
                    }
                    // Handle date fields if any
                    for (const key in doc) {
                        if (doc[key] && typeof doc[key] === 'object' && doc[key].\$date) {
                            doc[key] = new Date(doc[key].\$date);
                        }
                    }
                    return doc;
                });
                
                try {
                    const result = db.$collection_name.insertMany(documents, { ordered: false });
                    print('Inserted ' + Object.keys(result.insertedIds).length + ' documents');
                } catch (e) {
                    print('Error inserting documents: ' + e.message);
                }
            }
        " "$MONGODB_URI" 2>/dev/null; then
            print_success "Restored collection: $collection_name"
            restored_records=$((restored_records + count))
        else
            print_error "Failed to restore collection: $collection_name"
        fi
        
        # Clean up temporary file
        rm -f "$temp_file"
    done
    
    print_success "Total restored records: $restored_records"
}

# Clear user data for production/qa environments
clear_user_data() {
    print_info "Clearing user data for $NODE_ENV environment..."
    
    # Collections that should be cleared in non-development environments
    user_collections=("users" "authtokens")
    
    for collection in "${user_collections[@]}"; do
        result=$(mongosh --quiet --eval "
            const count = db.$collection.countDocuments();
            if (count > 0) {
                const result = db.$collection.deleteMany({});
                print('Cleared ' + result.deletedCount + ' documents from $collection');
            } else {
                print('No documents to clear in $collection');
            }
        " "$MONGODB_URI" 2>/dev/null)
        
        if [ $? -eq 0 ]; then
            print_success "$result"
        else
            print_warning "Failed to clear $collection collection"
        fi
    done
    
    print_success "User data cleared for $NODE_ENV environment"
}

# Create indexes
create_indexes() {
    print_info "Creating indexes..."
    
    # Create common indexes
    mongosh --quiet --eval "
        // Users collection indexes
        try {
            db.users.createIndex({ email: 1 }, { unique: true });
            db.users.createIndex({ username: 1 }, { unique: true });
            db.users.createIndex({ isActive: 1 });
            print('Created indexes for users collection');
        } catch (e) {
            print('Users collection indexes skipped: ' + e.message);
        }
        
        // Foods collection indexes
        try {
            db.foods.createIndex({ name: 1 });
            db.foods.createIndex({ category: 1 });
            db.foods.createIndex({ isActive: 1 });
            print('Created indexes for foods collection');
        } catch (e) {
            print('Foods collection indexes skipped: ' + e.message);
        }
        
        // Meal plans collection indexes
        try {
            db.meal_plans.createIndex({ name: 1 });
            db.meal_plans.createIndex({ category: 1 });
            print('Created indexes for meal_plans collection');
        } catch (e) {
            print('Meal plans collection indexes skipped: ' + e.message);
        }
        
        // Auth tokens collection indexes
        try {
            db.authtokens.createIndex({ token: 1 }, { unique: true });
            db.authtokens.createIndex({ userId: 1 });
            db.authtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
            print('Created indexes for authtokens collection');
        } catch (e) {
            print('Auth tokens collection indexes skipped: ' + e.message);
        }
    " "$MONGODB_URI"
    
    print_success "Indexes creation completed"
}

# Verify restoration
verify_restoration() {
    print_info "Verifying restoration..."
    
    # Get collection stats
    mongosh --quiet --eval "
        const collections = db.getCollectionNames();
        print('Collections in database: ' + collections.length);
        
        let totalDocs = 0;
        collections.forEach(function(collName) {
            const count = db[collName].countDocuments();
            totalDocs += count;
            print(collName + ': ' + count + ' documents');
        });
        
        print('Total documents in database: ' + totalDocs);
    " "$MONGODB_URI"
    
    print_success "Restoration verification completed"
}

# Main execution
main() {
    print_info "🔄 Starting database restoration..."
    
    # Check environment
    NODE_ENV=${NODE_ENV:-development}
    print_info "Environment: $NODE_ENV"
    
    # Confirm restoration in production
    if [ "$NODE_ENV" = "production" ]; then
        print_warning "Production environment detected!"
        print_warning "This will DELETE all existing data!"
        
        if [ "$1" != "--confirm-production" ]; then
            print_error "Production restore cancelled. Use --confirm-production flag to proceed."
            exit 1
        fi
    fi
    
    # Pre-flight checks
    check_mongodb
    check_backup_files
    
    # Perform restoration
    clear_database
    restore_collections
    
    # Clear user data for non-development environments
    if [ "$NODE_ENV" != "development" ]; then
        clear_user_data
    fi
    
    create_indexes
    verify_restoration
    
    print_success "🎉 Database restoration completed successfully!"
}

# Run main function with all arguments
main "$@" 