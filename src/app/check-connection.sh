#!/bin/bash

echo "🔍 Workzy Connection Diagnostic Tool"
echo "===================================="

# Check if .env files exist
echo "1. Checking environment files..."
if [ -f ".env" ]; then
    echo "✅ Frontend .env exists"
    echo "   VITE_API_URL: $(grep VITE_API_URL .env | cut -d'=' -f2)"
else
    echo "❌ Frontend .env missing"
fi

if [ -f "backend/.env" ]; then
    echo "✅ Backend .env exists"
    echo "   DATABASE_URL: $(grep DATABASE_URL backend/.env | cut -d'=' -f2 | sed 's/sriram123/****/g')"
    echo "   PORT: $(grep PORT backend/.env | cut -d'=' -f2)"
else
    echo "❌ Backend .env missing"
fi

# Check database connection
echo ""
echo "2. Testing database connection..."
if command -v psql >/dev/null 2>&1; then
    if PGPASSWORD=sriram123 psql -h localhost -U postgres -d workzy -c '\q' 2>/dev/null; then
        echo "✅ Database connection successful"
        
        # Check if tables exist
        TABLE_COUNT=$(PGPASSWORD=sriram123 psql -h localhost -U postgres -d workzy -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" 2>/dev/null | xargs)
        echo "   Tables in database: $TABLE_COUNT"
    else
        echo "❌ Database connection failed"
        echo "   Make sure PostgreSQL is running"
        echo "   Make sure database 'workzy' exists"
    fi
else
    echo "⚠️  psql not found - cannot test database connection"
fi

# Check if ports are available
echo ""
echo "3. Checking port availability..."
if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠️  Port 3001 is in use (Backend port)"
    echo "   Process using port 3001:"
    lsof -i :3001 | head -2
else
    echo "✅ Port 3001 available (Backend)"
fi

if lsof -i :5173 >/dev/null 2>&1; then
    echo "⚠️  Port 5173 is in use (Frontend port)"
    echo "   Process using port 5173:"
    lsof -i :5173 | head -2
else
    echo "✅ Port 5173 available (Frontend)"
fi

# Check if dependencies are installed
echo ""
echo "4. Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependencies missing - run 'npm install'"
fi

if [ -d "backend/node_modules" ]; then
    echo "✅ Backend dependencies installed"
else
    echo "❌ Backend dependencies missing - run 'cd backend && npm install'"
fi

# Check if Prisma client is generated
if [ -d "backend/node_modules/.prisma" ]; then
    echo "✅ Prisma client is generated"
else
    echo "❌ Prisma client not generated - run 'cd backend && npx prisma generate'"
fi

echo ""
echo "5. Quick test of backend API..."
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "✅ Backend is responding at http://localhost:3001"
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health)
    echo "   Health check: $HEALTH_RESPONSE"
else
    echo "❌ Backend is not responding at http://localhost:3001"
    echo "   Make sure to start the backend: cd backend && npm run dev"
fi

echo ""
echo "===================================="
echo "Diagnostic complete!"
echo ""