#!/bin/bash

echo "🚀 Starting Workzy Backend Server..."
echo "===================================="

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

echo -e "${BLUE}🔍 Checking requirements...${NC}"

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found. Please run this script from the project root.${NC}"
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
fi

# Check if npm is installed
if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ npm found: $(npm --version)${NC}"
fi

# Navigate to backend directory
cd backend

echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencies installed successfully${NC}"

echo -e "${BLUE}🗄️  Setting up Prisma...${NC}"
npx prisma generate

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to generate Prisma client${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prisma client generated${NC}"

# Check PostgreSQL connection
echo -e "${BLUE}🔍 Checking PostgreSQL connection...${NC}"
if command_exists psql && pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    
    # Check if database exists
    if psql -h localhost -p 5432 -U postgres -lqt | cut -d \| -f 1 | grep -qw workzy; then
        echo -e "${GREEN}✅ Database 'workzy' exists${NC}"
        
        echo -e "${BLUE}🗄️  Pushing database schema...${NC}"
        npx prisma db push
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database schema updated${NC}"
        else
            echo -e "${YELLOW}⚠️  Database schema push failed, but continuing...${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Database 'workzy' doesn't exist${NC}"
        echo -e "${YELLOW}   Creating database...${NC}"
        createdb -h localhost -p 5432 -U postgres workzy
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database created${NC}"
            npx prisma db push
        else
            echo -e "${YELLOW}⚠️  Could not create database. Please create manually:${NC}"
            echo -e "${YELLOW}   createdb -U postgres workzy${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL not accessible. Backend will run without database.${NC}"
fi

# Check if port 3001 is in use
if port_in_use 3001; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use. Attempting to free it...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 2
    
    if port_in_use 3001; then
        echo -e "${RED}❌ Could not free port 3001. Please kill the process manually:${NC}"
        echo -e "${YELLOW}   lsof -ti:3001 | xargs kill -9${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${GREEN}🎉 Starting backend server...${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Backend API: http://localhost:3001${NC}"
echo -e "${GREEN}Health Check: http://localhost:3001/health${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Start the development server
npm run dev