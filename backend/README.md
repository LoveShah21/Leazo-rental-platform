# Rental Management Backend

A production-grade Node.js backend for rental management with comprehensive features including inventory management, bookings, payments, and Shiprocket integration for India.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Product Management**: Comprehensive product catalog with inventory tracking
- **Availability System**: Real-time availability checking with temporary holds
- **Booking Management**: Complete booking lifecycle with status tracking
- **Payment Integration**: Stripe and Razorpay support with webhook handling
- **Shiprocket Integration**: Complete logistics integration for India
- **Real-time Updates**: Socket.IO for live inventory and booking updates
- **Caching**: Redis-based caching for performance
- **Background Jobs**: BullMQ for async processing
- **Comprehensive Logging**: Structured logging with correlation IDs
- **Security**: Production-ready security with rate limiting and validation

## 🛠 Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Real-time**: Socket.IO
- **Queue**: BullMQ
- **Validation**: Zod
- **Authentication**: JWT
- **Logging**: Pino
- **Payments**: Stripe, Razorpay
- **Logistics**: Shiprocket

## 📋 Prerequisites

- Node.js 18 or higher
- MongoDB 5.0 or higher
- Redis 6.0 or higher
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Environment Setup

\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` with your configuration:

\`\`\`env
# Database
MONGODB_URI=mongodb://localhost:27017/rental-management
REDIS_URL=redis://localhost:6379

# JWT Secrets (change these!)
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Payment Gateways
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...

# Shiprocket
SHIPROCKET_EMAIL=your-email@example.com
SHIPROCKET_PASSWORD=your-password
\`\`\`

### 3. Start Services

**Option A: Using Docker (Recommended)**

\`\`\`bash
docker-compose up -d
\`\`\`

**Option B: Local Development**

Start MongoDB and Redis locally, then:

\`\`\`bash
npm run dev
\`\`\`

### 4. Verify Installation

Check health endpoint:
\`\`\`bash
curl http://localhost:3000/health
\`\`\`

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user profile

### Product Endpoints

- `GET /api/products` - List products with search/filters
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/related` - Get related products
- `GET /api/products/meta/categories` - Get categories
- `GET /api/products/meta/tags` - Get popular tags

### Availability Endpoints

- `GET /api/availability` - Check product availability
- `POST /api/availability/holds` - Create inventory hold
- `DELETE /api/availability/holds/:id` - Cancel hold
- `GET /api/availability/holds` - Get user holds

### Health Endpoints

- `GET /health` - Basic health check
- `GET /ready` - Readiness check (includes DB/Redis)

## 🏗 Project Structure

\`\`\`
src/
├── config/          # Configuration files
│   ├── database.js  # MongoDB connection
│   ├── redis.js     # Redis connection & cache utils
│   └── socket.js    # Socket.IO setup
├── middleware/      # Express middleware
│   ├── auth.js      # Authentication & authorization
│   ├── errorHandler.js # Error handling
│   └── requestLogger.js # Request logging
├── models/          # Mongoose models
│   ├── User.js      # User model
│   ├── Product.js   # Product model
│   ├── Booking.js   # Booking model
│   └── Hold.js      # Inventory hold model
├── routes/          # API routes
│   ├── auth.js      # Authentication routes
│   ├── products.js  # Product routes
│   ├── availability.js # Availability routes
│   └── ...          # Other route files
├── utils/           # Utility functions
│   └── logger.js    # Logging configuration
└── server.js        # Main application file
\`\`\`

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm start` - Start production server

### Database Indexes

The application automatically creates necessary indexes for optimal performance:

- User indexes: email, role, plan, createdAt
- Product indexes: slug, category, status, pricing, rating
- Booking indexes: customer, product, dates, status
- Hold indexes: user, product, location, dates, expiration (TTL)

### Caching Strategy

- User data: 15 minutes
- Product data: 10 minutes
- Product lists: 5 minutes
- Categories/tags: 1 hour

## 🚀 Deployment

### Environment Variables

Ensure all required environment variables are set:

- Database connections
- JWT secrets
- Payment gateway credentials
- Shiprocket credentials
- Email configuration

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use strong JWT secrets
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS
- [ ] Configure rate limiting
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies
- [ ] Set up health checks

### Docker Deployment

\`\`\`bash
# Build image
docker build -t rental-backend .

# Run container
docker run -p 3000:3000 --env-file .env rental-backend
\`\`\`

## 🔒 Security Features

- JWT-based authentication with refresh tokens
- Role-based authorization (customer, staff, manager, admin)
- Rate limiting on sensitive endpoints
- Input validation with Zod
- SQL injection prevention with Mongoose
- XSS protection with Helmet
- CORS configuration
- Request logging with correlation IDs

## 📊 Monitoring

### Health Checks

- `/health` - Basic application health
- `/ready` - Database and Redis connectivity

### Logging

Structured JSON logging with:
- Request/response logging
- Error tracking with stack traces
- Performance monitoring
- Security event logging
- Business event tracking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run linting and tests
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information

---

Built with ❤️ for the rental management ecosystem.