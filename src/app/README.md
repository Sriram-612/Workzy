# 🚀 Workzy - Complete Freelancing Platform

A comprehensive, full-stack freelancing marketplace platform built with React, TypeScript, Node.js, and PostgreSQL. Workzy connects clients who need work done with skilled freelancers, featuring real-time messaging, secure payments, project management, and more.

## ✨ Features

### 🔐 Authentication & User Management
- JWT-based secure authentication
- Role-based access (Freelancer/Client)
- Comprehensive profile setup and management
- Avatar uploads and profile customization

### 💼 Job & Project Management
- Job posting with detailed requirements
- Advanced job search and filtering
- Proposal submission and management
- Project creation and tracking
- Milestone-based progress tracking

### 💬 Communication
- Real-time messaging with Socket.io
- File attachments in messages
- Typing indicators and read receipts
- Conversation management

### 💰 Secure Payments
- Stripe integration for secure payments
- Escrow payment protection
- 9.9% platform commission
- Payment history and invoicing
- Multi-currency support (INR focus)

### ⭐ Review & Rating System
- 5-star rating system
- Public/private review options
- Reputation building for freelancers
- Review statistics and analytics

### 🎨 Modern UI/UX
- Clean, professional design
- Dark/Light theme support
- Responsive design for all devices
- Beautiful background images
- Smooth animations with Framer Motion

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Framer Motion** for animations
- **React Router v6** for navigation
- **Shadcn/ui** component library
- **Lucide React** for icons
- **Sonner** for notifications

### Backend
- **Node.js** with Express.js
- **TypeScript** for type safety
- **PostgreSQL** database
- **Prisma ORM** for database management
- **Socket.io** for real-time communication
- **JWT** for authentication
- **Stripe** for payment processing
- **Bcrypt** for password hashing
- **Helmet** & **CORS** for security

### Development Tools
- **ESLint** & **Prettier** for code quality
- **Nodemon** for development
- **Docker** support (optional)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd workzy
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd backend
npm install
```

### 4. Setup Environment Variables

**Frontend (/.env):**
```env
REACT_APP_API_URL=http://localhost:3001/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
```

**Backend (/backend/.env):**
```env
DATABASE_URL="postgresql://workzy_user:workzy_password@localhost:5432/workzy_db"
JWT_SECRET="your-super-secret-jwt-key"
JWT_EXPIRES_IN="7d"
PORT=3001
NODE_ENV="development"
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
FRONTEND_URL="http://localhost:3000"
```

### 5. Setup Database
```bash
cd backend
chmod +x setup-database.sh
./setup-database.sh
```

Or manually:
```bash
# Create database
createdb workzy_db

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio
npx prisma studio
```

### 6. Start Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm start
```

### 7. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health
- **Prisma Studio**: http://localhost:5555

## 📱 Application Flow

### New User Journey
1. **Splash Screen** - Brand introduction
2. **Welcome Slides** - Feature overview
3. **Authentication** - Register/Login
4. **Role Selection** - Choose Freelancer or Client
5. **Profile Setup** - Complete profile with role-specific fields
6. **Dashboard** - Access role-based dashboard

### Freelancer Workflow
1. **Browse Jobs** - Search and filter opportunities
2. **Submit Proposals** - Apply with custom cover letters
3. **Project Management** - Track active projects
4. **Real-time Communication** - Chat with clients
5. **Secure Payments** - Receive payments via escrow
6. **Build Reputation** - Collect reviews and ratings

### Client Workflow
1. **Post Jobs** - Create detailed project listings
2. **Review Proposals** - Evaluate freelancer applications
3. **Hire Freelancers** - Select and hire best candidates
4. **Project Oversight** - Monitor progress and milestones
5. **Secure Payments** - Make payments through escrow
6. **Leave Reviews** - Rate freelancer performance

## 🗄 Database Schema

The application uses a comprehensive PostgreSQL schema with the following main entities:

- **Users** - User profiles with role-based fields
- **Jobs** - Job listings with requirements and budget
- **Proposals** - Freelancer applications
- **Projects** - Active work agreements
- **Messages** - Real-time messaging system
- **Payments** - Escrow transaction records
- **Reviews** - Rating and feedback system
- **Notifications** - User alerts and updates

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job by ID
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Users
- `GET /api/users/search/freelancers` - Search freelancers
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

### [Additional endpoints for proposals, projects, messages, payments, reviews, notifications...]

## 🎨 UI Components

The application includes 40+ custom UI components:
- Form components (Input, Select, Textarea, etc.)
- Display components (Card, Badge, Avatar, etc.)
- Navigation components (Sidebar, Breadcrumb, etc.)
- Feedback components (Toast, Progress, Alert, etc.)
- Overlay components (Dialog, Popover, Tooltip, etc.)

## 🌙 Theme System

Full dark/light mode support with:
- System preference detection
- Manual theme switching
- Consistent color variables
- Accessibility compliant contrast ratios

## 📱 Responsive Design

Mobile-first approach supporting:
- Mobile phones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Large screens (1280px+)

## 🔒 Security Features

- JWT token authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- CORS protection
- Helmet.js security headers
- Input validation and sanitization
- SQL injection prevention with Prisma

## 🚀 Deployment

### Production Build
```bash
# Frontend
npm run build

# Backend
cd backend
npm run build
```

### Environment Setup
- Configure production database
- Set up environment variables
- Configure SSL certificates
- Set up domain and DNS

### Recommended Hosting
- **Frontend**: Vercel, Netlify, or AWS S3
- **Backend**: Heroku, Railway, or AWS EC2
- **Database**: AWS RDS, Railway, or Supabase

## 📊 Performance

- Optimized bundle sizes
- Lazy loading for routes
- Image optimization
- Database query optimization
- Caching strategies
- CDN integration ready

## 🧪 Testing

```bash
# Frontend tests
npm test

# Backend tests
cd backend
npm test
```

## 📚 Documentation

- API documentation available at `/api/docs` (when running)
- Component documentation in Storybook
- Database schema documentation
- Deployment guides

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🎯 Roadmap

- [ ] Mobile applications (React Native)
- [ ] Advanced search with Elasticsearch
- [ ] Video calling integration
- [ ] AI-powered job matching
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Blockchain-based smart contracts

## 💬 Support

For support, email support@workzy.com or join our Discord community.

---

**Workzy** - Empowering the future of freelance work! 🚀