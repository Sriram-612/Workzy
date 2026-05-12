#!/bin/bash

echo "🚀 Workzy: Fixing Environment Issues and Starting..."

# Make sure we're in the right directory
cd "$(dirname "$0")"

# Check if .env files exist
echo "1. Checking environment files..."
if [ ! -f ".env" ]; then
    echo "❌ Frontend .env missing, creating..."
    cat > .env << 'EOF'
# Frontend Environment Variables
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Workzy
VITE_NODE_ENV=development

# Stripe Publishable Key (safe for client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Socket.io URL
VITE_SOCKET_URL=http://localhost:3001
EOF
    echo "✅ Frontend .env created"
else
    echo "✅ Frontend .env exists"
fi

if [ ! -f "backend/.env" ]; then
    echo "❌ Backend .env missing, creating..."
    cat > backend/.env << 'EOF'
# Database Configuration
DATABASE_URL="postgresql://postgres:sriram123@localhost:5432/workzy"

# Server Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Stripe Payment Configuration
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"

# Frontend URL (for CORS)
FRONTEND_URL="http://localhost:5173"

# Socket.io Configuration
SOCKET_CORS_ORIGIN="http://localhost:5173"

# Platform Configuration
PLATFORM_COMMISSION=9.9
EOF
    echo "✅ Backend .env created"
else
    echo "✅ Backend .env exists"
fi

# Install dependencies if needed
echo "2. Checking dependencies..."
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

# Generate Prisma client and push schema
echo "3. Setting up database..."
cd backend
echo "🔧 Generating Prisma client..."
npx prisma generate

echo "📊 Pushing database schema..."
npx prisma db push
cd ..

# Start the application
echo "4. Starting Workzy..."
echo "🎯 Frontend will run on: http://localhost:5173"
echo "🎯 Backend will run on: http://localhost:3001"
echo ""

# Function to start backend
start_backend() {
    echo "🔧 Starting backend server..."
    cd backend
    npm run dev &
    BACKEND_PID=$!
    cd ..
    echo "Backend PID: $BACKEND_PID"
}

# Function to start frontend
start_frontend() {
    echo "🎨 Starting frontend server..."
    npm run dev &
    FRONTEND_PID=$!
    echo "Frontend PID: $FRONTEND_PID"
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "Backend stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "Frontend stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start both servers
start_backend
sleep 3
start_frontend

echo ""
echo "✅ Both servers started!"
echo "🌐 Open http://localhost:5173 in your browser"
echo "📊 Backend API: http://localhost:3001/health"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait