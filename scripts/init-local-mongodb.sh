#!/bin/bash

# NutriGuide Backend - Local MongoDB Initialization Script
# This script initializes MongoDB for different environments without Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DEFAULT_ENV="development"
DEFAULT_DB_NAME="nutriguide"
DEFAULT_MONGO_HOST="localhost"
DEFAULT_MONGO_PORT="27017"

# Function to print colored output
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -e, --env ENV        Environment (development|qa|production) [default: development]"
    echo "  -d, --database NAME  Database name [default: nutriguide]"
    echo "  -h, --host HOST      MongoDB host [default: localhost]"
    echo "  -p, --port PORT      MongoDB port [default: 27017]"
    echo "  --help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Initialize development environment"
    echo "  $0 -e qa                             # Initialize QA environment"
    echo "  $0 -e production -d nutriguide_prod  # Initialize production with custom DB name"
}

# Parse command line arguments
ENV=$DEFAULT_ENV
DB_NAME=$DEFAULT_DB_NAME
MONGO_HOST=$DEFAULT_MONGO_HOST
MONGO_PORT=$DEFAULT_MONGO_PORT

while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--env)
            ENV="$2"
            shift 2
            ;;
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -h|--host)
            MONGO_HOST="$2"
            shift 2
            ;;
        -p|--port)
            MONGO_PORT="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Validate environment
if [[ ! "$ENV" =~ ^(development|qa|production)$ ]]; then
    print_error "Invalid environment: $ENV. Must be one of: development, qa, production"
    exit 1
fi

print_info "Initializing NutriGuide MongoDB for $ENV environment"
print_info "Database: $DB_NAME"
print_info "MongoDB: $MONGO_HOST:$MONGO_PORT"

# Check if MongoDB is running
print_info "Checking MongoDB connection..."
if ! mongosh --host "$MONGO_HOST:$MONGO_PORT" --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
    print_error "Cannot connect to MongoDB at $MONGO_HOST:$MONGO_PORT"
    print_error "Please ensure MongoDB is running and accessible"
    exit 1
fi
print_success "MongoDB connection successful"

# Set environment-specific database name if not provided
if [ "$DB_NAME" = "$DEFAULT_DB_NAME" ]; then
    case $ENV in
        development)
            DB_NAME="nutriguide_dev"
            ;;
        qa)
            DB_NAME="nutriguide_qa"
            ;;
        production)
            DB_NAME="nutriguide_prod"
            ;;
    esac
fi

# Create MongoDB initialization script with environment variables
TEMP_INIT_SCRIPT="/tmp/mongo-init-${ENV}-$(date +%s).js"
cat > "$TEMP_INIT_SCRIPT" << EOF
// MongoDB initialization script for NutriGuide - $ENV environment
const dbName = '$DB_NAME';
const env = '$ENV';

print(\`Initializing MongoDB for \${dbName} in \${env} environment\`);

// Connect to the database
db = db.getSiblingDB(dbName);

// Create collections with indexes
print('Creating collections and indexes...');

// Users collection
db.createCollection('users');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ phone: 1 }, { unique: true, sparse: true });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: 1 });
db.users.createIndex({ lastLoginAt: 1 });

// Auth tokens collection (for refresh tokens, verification codes, etc.)
db.createCollection('authtokens');
db.authtokens.createIndex({ userId: 1 });
db.authtokens.createIndex({ token: 1 }, { unique: true });
db.authtokens.createIndex({ type: 1 });
db.authtokens.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.authtokens.createIndex({ createdAt: 1 });

// SMS verification codes collection
db.createCollection('smsverifications');
db.smsverifications.createIndex({ phone: 1 });
db.smsverifications.createIndex({ code: 1 });
db.smsverifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
db.smsverifications.createIndex({ createdAt: 1 });

// Social logins collection (for third-party authentication)
db.createCollection('sociallogins');
db.sociallogins.createIndex({ userId: 1 });
db.sociallogins.createIndex({ provider: 1, providerId: 1 }, { unique: true });
db.sociallogins.createIndex({ createdAt: 1 });

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

print(\`MongoDB initialization for \${dbName} completed!\`);
EOF

# Execute the initialization script
print_info "Executing MongoDB initialization script..."
if mongosh --host "$MONGO_HOST:$MONGO_PORT" "$TEMP_INIT_SCRIPT" --quiet; then
    print_success "MongoDB initialization completed successfully!"
else
    print_error "MongoDB initialization failed"
    rm -f "$TEMP_INIT_SCRIPT"
    exit 1
fi

# Cleanup temporary script
rm -f "$TEMP_INIT_SCRIPT"

# Show next steps
echo ""
print_success "=== Initialization Complete ==="
print_info "Database: $DB_NAME"
print_info "Environment: $ENV"
echo ""
print_info "Next steps:"
print_info "1. Update your .env.$ENV file with the correct MongoDB URI:"
print_info "   MONGODB_URI=mongodb://$MONGO_HOST:$MONGO_PORT/$DB_NAME"
echo ""
print_info "2. Start the application:"
print_info "   npm run start:$ENV"
echo ""
print_info "3. Access API documentation:"
print_info "   http://localhost:3000/api/docs"
echo "" 