#!/bin/bash

# NutriGuide Backend Environment Setup Script

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if environment parameter is provided
if [ $# -eq 0 ]; then
    print_error "Environment parameter is required!"
    echo "Usage: $0 [development|qa|production]"
    exit 1
fi

ENVIRONMENT=$1

# Validate environment
case $ENVIRONMENT in
    development|dev)
        ENV_FILE=".env.development"
        DOCKER_COMPOSE_FILE="docker-compose.dev.yml"
        ;;
    qa)
        ENV_FILE=".env.qa"
        DOCKER_COMPOSE_FILE="docker-compose.qa.yml"
        ;;
    production|prod)
        ENV_FILE=".env.production"
        DOCKER_COMPOSE_FILE="docker-compose.prod.yml"
        ;;
    *)
        print_error "Invalid environment: $ENVIRONMENT"
        echo "Valid environments: development, qa, production"
        exit 1
        ;;
esac

print_info "Setting up environment: $ENVIRONMENT"

# Check if environment file exists
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file $ENV_FILE not found!"
    exit 1
fi

# Copy environment file to .env
cp "$ENV_FILE" .env
print_success "Copied $ENV_FILE to .env"

# Set NODE_ENV environment variable
export NODE_ENV=$ENVIRONMENT
print_success "Set NODE_ENV to $ENVIRONMENT"

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    print_info "Installing dependencies..."
    npm install
    print_success "Dependencies installed"
fi

print_success "Environment setup completed for: $ENVIRONMENT"
print_info "You can now run:"
echo "  - npm run start:dev    (for development)"
echo "  - npm run start:qa     (for qa)"
echo "  - npm run start:prod   (for production)"
echo "  - docker-compose -f $DOCKER_COMPOSE_FILE up  (with Docker)" 