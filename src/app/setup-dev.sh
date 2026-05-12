#!/bin/bash

# Workzy Development Setup Script
echo "🚀 Setting up Workzy Development Environment..."

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

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) detected"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    print_warning "PostgreSQL is not installed."
    echo "Please install PostgreSQL 14+ from: https://www.postgresql.org/download/"
    echo "Or you can use a cloud database service like Railway, Supabase, or AWS RDS"
    echo ""
    read -p "Do you want to continue without local PostgreSQL? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "PostgreSQL detected"
fi

print_status "Installing frontend dependencies..."
npm install
if [ $? -eq 0 ]; then
    print_success "Frontend dependencies installed"
else
    print_error "Failed to install frontend dependencies"
    exit 1
fi

print_status "Installing backend dependencies..."
cd backend
npm install
if [ $? -eq 0 ]; then
    print_success "Backend dependencies installed"
else
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Setup environment files
print_status "Setting up environment files..."

# Frontend .env
if [ ! -f "../.env" ]; then
    cat > ../.env << 'EOF'
# Workzy Frontend Environment Variables
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
EOF
    print_success "Created frontend .env file"
else
    print_warning "Frontend .env file already exists"
fi

# Backend .env
if [ ! -f ".env" ]; then
    cat > .env << 'EOF'
# Database
DATABASE_URL="postgresql://workzy_user:workzy_password@localhost:5432/workzy_db"

# JWT
JWT_SECRET="workzy-super-secret-jwt-key-2024-development"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# Stripe (for payments) - Replace with your test keys
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key_here"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR="uploads"

# CORS
FRONTEND_URL="http://localhost:3000"

# Email (optional - for notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
EOF
    print_success "Created backend .env file"
else
    print_warning "Backend .env file already exists"
fi

# Database setup
if command -v psql &> /dev/null; then
    print_status "Setting up database..."
    
    # Create database
    print_status "Creating database 'workzy_db'..."
    createdb workzy_db 2>/dev/null || print_warning "Database might already exist"
    
    # Generate Prisma client
    print_status "Generating Prisma client..."
    npx prisma generate
    
    # Push database schema
    print_status "Pushing database schema..."
    npx prisma db push
    
    print_success "Database setup complete"
else
    print_warning "Skipping database setup (PostgreSQL not found)"
    print_status "Please update the DATABASE_URL in backend/.env with your database connection string"
fi

cd ..

# Create development scripts
print_status "Creating development scripts..."

# Create start script
cat > start-dev.sh << 'EOF'
#!/bin/bash

# Start both frontend and backend in development mode
echo "🚀 Starting Workzy Development Servers..."

# Function to handle cleanup
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Set up trap to catch Ctrl+C
trap cleanup SIGINT

# Start backend
echo "📡 Starting backend server..."
cd backend && npm run dev &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "🎨 Starting frontend server..."
cd .. && npm start &
FRONTEND_PID=$!

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
EOF

chmod +x start-dev.sh

# Create package.json scripts for easy development
cat > package.json << 'EOF'
{
  "name": "workzy",
  "version": "1.0.0",
  "description": "Complete freelancing platform",
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject",
    "dev": "./start-dev.sh",
    "setup": "./setup-dev.sh",
    "backend": "cd backend && npm run dev",
    "db:studio": "cd backend && npx prisma studio",
    "db:reset": "cd backend && npx prisma migrate reset",
    "lint": "eslint src --ext .ts,.tsx",
    "format": "prettier --write src/**/*.{ts,tsx}"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.8.0",
    "react-scripts": "5.0.1",
    "typescript": "^4.9.5",
    "@types/node": "^18.14.2",
    "@types/react": "^18.0.28",
    "@types/react-dom": "^18.0.11",
    "motion": "^10.16.0",
    "lucide-react": "^0.263.1",
    "sonner": "^1.4.0"
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
EOF

print_success "Setup completed successfully! 🎉"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
print_success "🎉 Workzy Development Environment Setup Complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Update Stripe keys in .env files (both frontend and backend)"
echo "   2. Update database URL if using external database"
echo "   3. Start development servers"
echo ""
echo "🚀 Quick Start Commands:"
echo "   • Start both servers:     ${GREEN}npm run dev${NC}"
echo "   • Start frontend only:    ${GREEN}npm start${NC}"
echo "   • Start backend only:     ${GREEN}npm run backend${NC}"
echo "   • Open database studio:   ${GREEN}npm run db:studio${NC}"
echo ""
echo "🌐 Access URLs:"
echo "   • Frontend:              ${BLUE}http://localhost:3000${NC}"
echo "   • Backend API:           ${BLUE}http://localhost:3001${NC}"
echo "   • API Health Check:      ${BLUE}http://localhost:3001/health${NC}"
echo "   • Prisma Studio:         ${BLUE}http://localhost:5555${NC}"
echo ""
echo "📚 Documentation:"
echo "   • README:                ${BLUE}./README.md${NC}"
echo "   • API Documentation:     ${BLUE}Available at /api/docs${NC}"
echo ""
echo "🔑 Important:"
echo "   • Replace Stripe test keys in .env files"
echo "   • Update database connection if using external DB"
echo "   • Check firewall settings for ports 3000, 3001, 5432"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"