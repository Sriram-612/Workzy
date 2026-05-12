#!/bin/bash

echo "🚀 Starting Workzy Full Stack Application..."
echo "=============================================="

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

echo -e "${BLUE}🔍 Checking system requirements...${NC}"

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

# Check if PostgreSQL is running
echo -e "${BLUE}🔍 Checking PostgreSQL connection...${NC}"
if command_exists psql && pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL is running${NC}"
    
    # Check if database exists
    if psql -h localhost -p 5432 -U postgres -lqt | cut -d \| -f 1 | grep -qw workzy; then
        echo -e "${GREEN}✅ Database 'workzy' exists${NC}"
    else
        echo -e "${YELLOW}⚠️  Database 'workzy' doesn't exist. Creating it...${NC}"
        createdb -h localhost -p 5432 -U postgres workzy
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ Database 'workzy' created successfully${NC}"
        else
            echo -e "${RED}❌ Failed to create database. Please create it manually:${NC}"
            echo -e "${YELLOW}   createdb -U postgres workzy${NC}"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  PostgreSQL is not running or not accessible${NC}"
    echo -e "${YELLOW}   The app will run in mock data mode${NC}"
    echo -e "${YELLOW}   To enable database functionality:${NC}"
    echo -e "${YELLOW}   1. Start PostgreSQL service${NC}"
    echo -e "${YELLOW}   2. Create database: createdb -U postgres workzy${NC}"
    echo -e "${YELLOW}   3. Restart this script${NC}"
fi

echo ""
echo -e "${BLUE}📦 Setting up backend...${NC}"

# Check if backend directory exists
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Backend directory not found${NC}"
    exit 1
fi

cd backend

# Install backend dependencies
echo -e "${BLUE}📦 Installing backend dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi

# Setup Prisma
echo -e "${BLUE}🗄️  Setting up Prisma ORM...${NC}"
npx prisma generate

# Try to push database schema
if pg_isready -h localhost -p 5432 -U postgres > /dev/null 2>&1; then
    echo -e "${BLUE}🗄️  Pushing database schema...${NC}"
    npx prisma db push
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database schema pushed successfully${NC}"
    else
        echo -e "${YELLOW}⚠️  Database schema push failed. Check your PostgreSQL connection.${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Skipping database setup (PostgreSQL not available)${NC}"
fi

# Check if port 3001 is in use
if port_in_use 3001; then
    echo -e "${YELLOW}⚠️  Port 3001 is already in use. Trying to kill existing process...${NC}"
    lsof -ti:3001 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo -e "${BLUE}🔥 Starting backend server...${NC}"

# Start backend in background
npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Check if backend started successfully
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server started on port 3001${NC}"
else
    echo -e "${RED}❌ Failed to start backend server${NC}"
    exit 1
fi

# Go back to root directory
cd ..

echo ""
echo -e "${BLUE}🌐 Setting up frontend...${NC}"

# Install frontend dependencies (if package.json exists)
if [ -f "package.json" ]; then
    echo -e "${BLUE}📦 Installing frontend dependencies...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        kill $BACKEND_PID 2>/dev/null
        exit 1
    fi
fi

# Check if port 3000 is in use
if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Port 3000 is already in use. Trying to kill existing process...${NC}"
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo ""
echo -e "${GREEN}🎉 Setup complete! Starting Workzy...${NC}"
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}Backend API: http://localhost:3001${NC}"
echo -e "${GREEN}Frontend App: http://localhost:3000${NC}"
echo -e "${GREEN}============================================${NC}"

# Test backend health
echo -e "${BLUE}🏥 Testing backend health...${NC}"
sleep 2
if curl -s http://localhost:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is healthy and responding${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check failed, but continuing...${NC}"
fi

echo ""
echo -e "${BLUE}🚀 Starting frontend development server...${NC}"

# Start frontend (this will block)
if [ -f "package.json" ]; then
    echo -e "${BLUE}🚀 Starting React development server...${NC}"
    npm start
else
    echo -e "${YELLOW}⚠️  No package.json found in root. Please create one or start manually.${NC}"
    echo -e "${YELLOW}   You can run: npx create-react-app workzy-frontend${NC}"
fi

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down Workzy...${NC}"
    kill $BACKEND_PID 2>/dev/null
    echo -e "${GREEN}✅ Cleanup complete${NC}"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup INT TERM EXIT