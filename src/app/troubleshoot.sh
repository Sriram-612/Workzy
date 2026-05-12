#!/bin/bash

echo "🔧 Workzy Troubleshooting Tool"
echo "============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

echo -e "${BLUE}1. System Requirements Check${NC}"
echo "================================"

# Check Node.js
if command_exists node; then
    echo -e "${GREEN}✅ Node.js: $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
fi

# Check npm
if command_exists npm; then
    echo -e "${GREEN}✅ npm: $(npm --version)${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
fi

# Check PostgreSQL
if command_exists psql; then
    echo -e "${GREEN}✅ PostgreSQL client found${NC}"
    if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PostgreSQL server running${NC}"
        
        # Check database
        if psql -h localhost -p 5432 -U postgres -lqt | cut -d \| -f 1 | grep -qw workzy; then
            echo -e "${GREEN}✅ Database 'workzy' exists${NC}"
        else
            echo -e "${RED}❌ Database 'workzy' not found${NC}"
            echo -e "${YELLOW}   Run: createdb -U postgres workzy${NC}"
        fi
    else
        echo -e "${RED}❌ PostgreSQL server not accessible${NC}"
        echo -e "${YELLOW}   Check if PostgreSQL is running on localhost:5432${NC}"
    fi
else
    echo -e "${RED}❌ PostgreSQL client not found${NC}"
fi

echo ""
echo -e "${BLUE}2. Port Availability Check${NC}"
echo "============================"

# Check port 3000 (frontend)
if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is in use${NC}"
    echo -e "${YELLOW}   Process: $(lsof -ti:3000 | head -1)${NC}"
else
    echo -e "${GREEN}✅ Port 3000 available${NC}"
fi

# Check port 3001 (backend)
if port_in_use 3001; then
    echo -e "${YELLOW}⚠️  Port 3001 is in use${NC}"
    echo -e "${YELLOW}   Process: $(lsof -ti:3001 | head -1)${NC}"
else
    echo -e "${GREEN}✅ Port 3001 available${NC}"
fi

echo ""
echo -e "${BLUE}3. Backend Health Check${NC}"
echo "======================="

# Check if backend process is running
BACKEND_PROCESS=$(ps aux | grep "node.*server.ts\|npm.*run.*dev" | grep -v grep | head -1)
if [ -n "$BACKEND_PROCESS" ]; then
    echo -e "${GREEN}✅ Backend process found${NC}"
    echo -e "${GREEN}   Process: $(echo $BACKEND_PROCESS | awk '{print $2, $11, $12, $13}')${NC}"
else
    echo -e "${RED}❌ No backend process found${NC}"
fi

# Test API connectivity
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend API responding${NC}"
    HEALTH_RESPONSE=$(curl -s http://localhost:3001/health | jq -r '.message' 2>/dev/null || echo "Backend responding")
    echo -e "${GREEN}   Response: $HEALTH_RESPONSE${NC}"
else
    echo -e "${RED}❌ Backend API not responding${NC}"
    echo -e "${YELLOW}   Possible issues:${NC}"
    echo -e "${YELLOW}   - Backend server not started${NC}"
    echo -e "${YELLOW}   - Port 3001 blocked or in use${NC}"
    echo -e "${YELLOW}   - Environment configuration error${NC}"
fi

# Test specific API endpoints
echo -e "${BLUE}   Testing API endpoints:${NC}"
if curl -s http://localhost:3001/api/auth/me > /dev/null 2>&1; then
    echo -e "${GREEN}   ✅ Auth endpoint accessible${NC}"
else
    echo -e "${RED}   ❌ Auth endpoint not accessible${NC}"
fi

echo ""
echo -e "${BLUE}4. File Structure Check${NC}"
echo "======================"

# Check essential files
files=(
    ".env"
    "backend/.env"
    "backend/package.json"
    "backend/prisma/schema.prisma"
    "backend/src/server.ts"
    "services/api.ts"
    "App.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC}"
    else
        echo -e "${RED}❌ $file missing${NC}"
    fi
done

echo ""
echo -e "${BLUE}5. Environment Variables Check${NC}"
echo "============================="

if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Frontend .env exists${NC}"
    if grep -q "REACT_APP_API_URL" .env; then
        API_URL=$(grep "REACT_APP_API_URL" .env | cut -d'=' -f2)
        echo -e "${GREEN}   API URL: $API_URL${NC}"
    else
        echo -e "${RED}❌ REACT_APP_API_URL not found in .env${NC}"
    fi
else
    echo -e "${RED}❌ Frontend .env missing${NC}"
fi

if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ Backend .env exists${NC}"
    if grep -q "DATABASE_URL" backend/.env; then
        echo -e "${GREEN}   DATABASE_URL configured${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL not found in backend/.env${NC}"
    fi
    if grep -q "JWT_SECRET" backend/.env; then
        echo -e "${GREEN}   JWT_SECRET configured${NC}"
    else
        echo -e "${RED}❌ JWT_SECRET not found in backend/.env${NC}"
    fi
else
    echo -e "${RED}❌ Backend .env missing${NC}"
fi

echo ""
echo -e "${BLUE}6. Quick Fixes${NC}"
echo "=============="

echo -e "${YELLOW}To kill processes on ports:${NC}"
echo -e "${YELLOW}  lsof -ti:3000 | xargs kill -9  # Kill frontend${NC}"
echo -e "${YELLOW}  lsof -ti:3001 | xargs kill -9  # Kill backend${NC}"

echo ""
echo -e "${YELLOW}To restart PostgreSQL:${NC}"
echo -e "${YELLOW}  sudo service postgresql restart    # Linux${NC}"
echo -e "${YELLOW}  brew services restart postgresql  # macOS${NC}"

echo ""
echo -e "${YELLOW}To create database:${NC}"
echo -e "${YELLOW}  createdb -U postgres workzy${NC}"

echo ""
echo -e "${YELLOW}To start the application:${NC}"
echo -e "${YELLOW}  chmod +x start-workzy.sh && ./start-workzy.sh${NC}"

echo ""
echo -e "${GREEN}Troubleshooting complete!${NC}"