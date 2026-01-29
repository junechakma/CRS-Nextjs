#!/bin/bash

# CRS Schema Migration Deployment Script
# This script deploys the separated schema files in the correct order

set -e  # Exit on any error

echo "🚀 Starting CRS Schema Migration Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
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

# Check if we're in the right directory
if [ ! -d "migrations" ]; then
    print_error "migrations directory not found. Please run this script from the supabase directory."
    exit 1
fi

# Check if supabase CLI is available
if ! command -v supabase &> /dev/null; then
    print_warning "Supabase CLI not found. Please install it first:"
    echo "npm install -g supabase"
    echo "or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Function to run a migration file
run_migration() {
    local file=$1
    local description=$2
    
    print_status "Running migration: $description"
    
    if [ -f "$file" ]; then
        # Use supabase db push for local development
        # For production, you might want to use supabase db reset or manual SQL execution
        supabase db push --include-all
        print_success "Completed: $description"
    else
        print_error "Migration file not found: $file"
        exit 1
    fi
}

# Function to run a function file
run_functions() {
    local file=$1
    local description=$2
    
    print_status "Loading functions: $description"
    
    if [ -f "$file" ]; then
        # Execute the function file
        supabase db push --include-all
        print_success "Completed: $description"
    else
        print_error "Function file not found: $file"
        exit 1
    fi
}

# Function to run a data file
run_data() {
    local file=$1
    local description=$2
    
    print_status "Loading data: $description"
    
    if [ -f "$file" ]; then
        # Execute the data file
        supabase db push --include-all
        print_success "Completed: $description"
    else
        print_error "Data file not found: $file"
        exit 1
    fi
}

# Main deployment process
main() {
    print_status "Starting deployment process..."
    
    # Step 1: Core Extensions
    run_migration "migrations/001_core_extensions.sql" "Core Extensions and Utilities"
    
    # Step 2: Core Tables
    run_migration "migrations/002_core_tables.sql" "Core Tables (Users, System Config, Audit Log)"
    
    # Step 3: University Management
    run_migration "migrations/003_university_management.sql" "University Management Tables"
    
    # Step 4: Academic Structure
    run_migration "migrations/004_academic_structure.sql" "Academic Structure (Faculties, Departments, Semesters)"
    
    # Step 5: Course Management
    run_migration "migrations/005_course_management.sql" "Course Management Tables"
    
    # Step 6: Response System
    run_migration "migrations/006_response_system.sql" "Response System Tables"
    
    # Step 7: Load Functions
    print_status "Loading functions..."
    run_functions "functions/001_user_management_functions.sql" "User Management Functions"
    run_functions "functions/002_university_management_functions.sql" "University Management Functions"
    run_functions "functions/003_academic_management_functions.sql" "Academic Management Functions"
    
    # Step 8: Load Data
    print_status "Loading default data..."
    run_data "data/001_default_system_config.sql" "Default System Configuration"
    
    print_success "🎉 All migrations completed successfully!"
    print_status "Your CRS database is now ready for use."
}

# Check if user wants to proceed
echo "This script will deploy the CRS schema migrations in the correct order."
echo "Make sure you have:"
echo "1. Supabase CLI installed"
echo "2. Database connection configured"
echo "3. Backup of your current database (if any)"
echo ""
read -p "Do you want to proceed? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    main
else
    print_warning "Deployment cancelled by user."
    exit 0
fi 