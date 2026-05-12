#!/bin/bash

echo "🚀 Starting Workzy Backend Setup..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to backend directory
cd backend

echo "📦 Installing backend dependencies..."
npm install

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if ! pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo "⚠️  PostgreSQL is not running on localhost:5432"
    echo "Please make sure PostgreSQL is running and the 'workzy' database exists."
    echo "You can create the database by running:"
    echo "  createdb -U postgres workzy"
    echo ""
fi

echo "🗄️  Setting up database..."
npx prisma generate
npx prisma db push

echo "🔥 Starting development server..."
npm run dev