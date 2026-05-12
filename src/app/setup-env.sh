#!/bin/bash

echo "🚀 Setting up Workzy Environment..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if .env files exist
if [ ! -f ".env" ]; then
    echo "❌ Frontend .env file is missing!"
    echo "Creating .env file..."
    cp .env.example .env 2>/dev/null || echo "No .env.example found, .env should already be created"
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env file is missing!"
    echo "Creating backend/.env file..."
    cp backend/.env.example backend/.env 2>/dev/null || echo "Backend .env should already be created"
fi

echo "✅ Environment files are set up!"

# Check if PostgreSQL is running
echo "🔍 Checking PostgreSQL connection..."
if command -v psql >/dev/null 2>&1; then
    # Test the database connection
    if PGPASSWORD=sriram123 psql -h localhost -U postgres -d workzy -c '\q' 2>/dev/null; then
        echo "✅ PostgreSQL connection successful!"
    else
        echo "❌ Cannot connect to PostgreSQL database!"
        echo "Make sure PostgreSQL is running and the database 'workzy' exists."
        echo "Connection string: postgresql://postgres:sriram123@localhost:5432/workzy"
    fi
else
    echo "⚠️  psql command not found. Please ensure PostgreSQL is installed and running."
fi

# Check Node.js version
echo "🔍 Checking Node.js version..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js version: $NODE_VERSION"
else
    echo "❌ Node.js is not installed!"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend
    npm install
    cd ..
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate
echo "✅ Prisma client generated!"

# Push database schema
echo "📊 Pushing database schema..."
npx prisma db push
echo "✅ Database schema updated!"

cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your Stripe keys in backend/.env (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY)"
echo "2. Update your Stripe publishable key in .env (VITE_STRIPE_PUBLISHABLE_KEY)"
echo "3. Run the application:"
echo "   - Frontend: npm run dev"
echo "   - Backend: cd backend && npm run dev"
echo "   - Or both: ./start-workzy.sh"
echo ""
echo "Your environment variables are located at:"
echo "- Frontend: .env"
echo "- Backend: backend/.env"
echo ""