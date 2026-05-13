# Workzy Database Setup Guide

## Prerequisites
- PostgreSQL installed and running
- Node.js and npm installed
- PgAdmin4 running (if you want to use the GUI)

## Quick Setup

### 1. Database Setup
Make sure PostgreSQL is running and create the database:

```bash
# Connect to PostgreSQL (using psql or pgAdmin)
createdb -U postgres workzy

# Or in psql:
psql -U postgres
CREATE DATABASE workzy;
\q
```

### 2. Backend Setup
```bash
# Make the startup script executable
chmod +x start-backend.sh

# Run the backend setup and start script
./start-backend.sh
```

This script will:
- Install backend dependencies
- Generate Prisma client
- Push database schema to PostgreSQL
- Start the development server on port 3001

### 3. Frontend Setup
The frontend is already configured to connect to your database through the backend API.

Just run your frontend development server (if not already running):
```bash
npm start
# or
npm run dev
```

## Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001/api
```

### Backend (backend/.env)
```
DATABASE_URL="postgresql://postgres:sriram123@localhost:5432/workzy"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Testing the Connection

1. Start the backend: `./start-backend.sh`
2. Check health endpoint: `curl http://localhost:3001/health`
3. Start the frontend and register a new user
4. Check your PostgreSQL database to see the new user entry

## Database Schema

The system uses the following main tables:
- `users` - User accounts (freelancers and clients)
- `jobs` - Job postings
- `proposals` - Freelancer proposals for jobs
- `projects` - Active projects between clients and freelancers
- `messages` - Real-time messaging system
- `payments` - Direct Razorpay payment tracking
- `reviews` - User reviews and ratings
- `notifications` - System notifications

## Troubleshooting

### Common Issues:

1. **Connection refused**: Make sure PostgreSQL is running on port 5432
2. **Database doesn't exist**: Create the 'workzy' database manually
3. **Permission denied**: Make sure the postgres user has the correct password
4. **Port already in use**: Change the PORT in backend/.env if 3001 is occupied

### Checking Database Connection:

```bash
# Test PostgreSQL connection
psql -h localhost -p 5432 -U postgres -d workzy

# Check if backend is running
curl http://localhost:3001/health
```

### Reset Database (if needed):

```bash
cd backend
npx prisma migrate reset
npx prisma db push
```

## Production Notes

- Change JWT_SECRET to a secure random string
- Use environment-specific database URLs
- Enable SSL for database connections in production
- Set up proper backup strategies
- Configure rate limiting and security headers
