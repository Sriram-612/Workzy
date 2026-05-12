#!/bin/bash

echo "🚀 Starting Workzy (Simple Mode)..."

# Check if .env files exist and create them if missing
if [ ! -f ".env" ]; then
    echo "Creating frontend .env..."
    cat > .env << 'EOF'
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Workzy
VITE_NODE_ENV=development
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
VITE_SOCKET_URL=http://localhost:3001
EOF
fi

if [ ! -f "backend/.env" ]; then
    echo "Creating backend .env..."
    cat > backend/.env << 'EOF'
DATABASE_URL="postgresql://postgres:sriram123@localhost:5432/workzy"
PORT=3001
NODE_ENV=development
JWT_SECRET="workzy-jwt-secret-key"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_your_key_here" 
FRONTEND_URL="http://localhost:5173"
PLATFORM_COMMISSION=9.9
EOF
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent

# Start in development mode
echo "🎯 Starting frontend on http://localhost:5173"
npm run dev