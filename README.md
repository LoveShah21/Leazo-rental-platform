# 🏢 Leazo - Premium Rental Platform

A comprehensive, production-ready rental management platform built with modern technologies. Streamline your entire rental business from product browsing to returns, with advanced features for inventory management, payments, logistics, and customer engagement.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-14+-blue.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-7+-green.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)


## video-url: https://drive.google.com/file/d/18ugBCDDr8BEPo_sf94NRPpWBPAWV9Ase/view?usp=drive_link 
### email automation at the end of the checkout process: 
<img width="1503" height="845" alt="image" src="https://github.com/user-attachments/assets/49bd8fb8-de95-4433-b60b-a63dc3a7ec25" />
<img width="1329" height="921" alt="image" src="https://github.com/user-attachments/assets/605a5b4e-231f-48dd-81df-cf0a91db8188" />
<img width="1222" height="927" alt="image" src="https://github.com/user-attachments/assets/80fb608e-b680-4619-bc7d-a809d2826d83" />
## 🌟 Key Features


### 🛍️ **Product & Inventory Management**

- **Real-time Availability**: Prevent overbooking with intelligent inventory tracking
- **Multi-location Support**: Manage products across different locations
- **Dynamic Pricing**: Flexible pricing models (hourly, daily, weekly, monthly)
- **Product Categories**: Organized catalog with search and filtering
- **Image Management**: Cloudinary integration for optimized media handling

### 👥 **Customer Experience**

- **Role-based Access**: Customer, Provider, Staff, Manager, Admin, Super Admin
- **Customer Segmentation**: VIP, seasonal, and regular customer pricing
- **Booking Management**: Complete booking lifecycle with status tracking
- **Real-time Notifications**: Email and in-app notifications
- **Review System**: Customer feedback and rating system

### 💳 **Payment & Billing**

- **Multiple Payment Gateways**: Stripe, Razorpay, Cashfree integration
- **Flexible Invoicing**: Full, partial, or deposit-based payments
- **Late Fee Management**: Automated late fee calculation and tracking
- **PDF Generation**: Professional invoices and booking confirmations
- **Webhook Support**: Real-time payment status updates

### 🚚 **Logistics & Shipping**

- **Delhivery Integration**: Complete logistics solution for India
- **Pickup & Delivery**: Automated scheduling and tracking
- **AWB Tracking**: Real-time shipment tracking
- **Return Management**: Streamlined return process

### 📊 **Analytics & Reporting**

- **Dashboard Analytics**: Revenue, bookings, and performance metrics
- **Customer Insights**: Booking patterns and customer behavior
- **Product Performance**: Top rented products and revenue analysis
- **Export Capabilities**: CSV and Excel report generation

### 🔧 **Technical Excellence**

- **Microservices Architecture**: Scalable and maintainable codebase
- **Real-time Updates**: Socket.IO for live inventory and booking updates
- **Background Jobs**: BullMQ for async processing
- **Caching Strategy**: Redis-based performance optimization
- **Security First**: JWT authentication, rate limiting, input validation
- **Production Ready**: Docker support, health checks, monitoring

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   (Next.js)     │◄──►│   (Node.js)     │◄──►│   (MongoDB)     │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Express.js    │    │ • MongoDB 7+    │
│ • TypeScript    │    │ • Socket.IO     │    │ • Redis Cache   │
│ • Tailwind CSS  │    │ • BullMQ        │    │ • Indexes       │
│ • Tanstack Query│    │ • Zod Validation│    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   External      │
                    │   Services      │
                    │                 │
                    │ • Cloudinary    │
                    │ • Delhivery     │
                    │ • Payment APIs  │
                    │ • Email Service │
                    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+
- **MongoDB** 5.0+
- **Redis** 6.0+
- **npm** or **yarn**

### 1. Clone Repository

```bash
git clone https://github.com/your-username/leazo-rental-platform.git
cd leazo-rental-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run setup  # Creates admin user and sample data
npm run dev    # Start development server
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Start Next.js development server
```

### 4. Docker Setup (Recommended)

```bash
cd backend
docker-compose up -d  # Starts MongoDB, Redis, and backend
```

### 5. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **MongoDB Express**: http://localhost:8081 (admin/admin123)

## 📱 User Roles & Dashboards

### 🛒 **Customer Dashboard**

- Browse and search products
- Make bookings and payments
- Track rental status
- Manage profile and preferences
- View booking history and invoices

### 🏪 **Provider Dashboard**

- Manage product inventory
- Handle booking approvals
- Track revenue and analytics
- Manage locations and pricing
- Customer communication

### 👨‍💼 **Admin Dashboard**

- User management and roles
- System-wide analytics
- Payment and transaction monitoring
- Content management
- System configuration

## 🛠️ Technology Stack

### **Backend**

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Queue**: BullMQ for background jobs
- **Authentication**: JWT with refresh tokens
- **Validation**: Zod schema validation
- **File Upload**: Multer + Cloudinary
- **PDF Generation**: PDFKit
- **Real-time**: Socket.IO
- **Logging**: Pino structured logging
- **Testing**: Jest + Supertest

### **Frontend**

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI + Custom components
- **State Management**: Zustand + TanStack Query
- **Authentication**: Custom JWT implementation
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion

### **Infrastructure**

- **Containerization**: Docker + Docker Compose
- **Database**: MongoDB 7+ with replica set support
- **Cache**: Redis 7+ with persistence
- **File Storage**: Cloudinary CDN
- **Email**: Nodemailer with SMTP
- **Monitoring**: Health checks + structured logging

### **External Integrations**

- **Payments**: Stripe, Razorpay, Cashfree
- **Logistics**: Delhivery (India)
- **Storage**: Cloudinary
- **Email**: SMTP providers
- **Maps**: Google Maps API (optional)

## 📊 API Documentation

### **Authentication Endpoints**

```
POST   /api/auth/register     # User registration
POST   /api/auth/login        # User login
POST   /api/auth/refresh      # Refresh access token
POST   /api/auth/logout       # User logout
GET    /api/auth/me           # Get current user
```

### **Product Endpoints**

```
GET    /api/products          # List products with filters
GET    /api/products/:id      # Get single product
POST   /api/products          # Create product (provider)
PUT    /api/products/:id      # Update product (provider)
DELETE /api/products/:id      # Delete product (provider)
```

### **Booking Endpoints**

```
GET    /api/bookings          # List user bookings
POST   /api/bookings          # Create new booking
GET    /api/bookings/:id      # Get booking details
PATCH  /api/bookings/:id      # Update booking status
DELETE /api/bookings/:id      # Cancel booking
```

### **Payment Endpoints**

```
POST   /api/payments/create-intent    # Create payment intent
POST   /api/payments/confirm          # Confirm payment
GET    /api/payments/history          # Payment history
POST   /api/webhooks/stripe           # Stripe webhooks
POST   /api/webhooks/razorpay         # Razorpay webhooks
```

## 🔧 Configuration

### **Environment Variables**

#### **Database**

```env
MONGODB_URI=mongodb://localhost:27017/rental-management
REDIS_URL=redis://localhost:6379
```

#### **Authentication**

```env
JWT_ACCESS_SECRET=your-super-secret-access-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

#### **Payment Gateways**

```env
STRIPE_SECRET_KEY=sk_test_...
RAZORPAY_KEY_ID=rzp_test_...
CASHFREE_CLIENT_ID=your-client-id
```

#### **File Upload**

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

#### **Email Service**

```env
SMTP_HOST=smtp.gmail.com
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

## 🚀 Deployment

### **Docker Production**

```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or build individual services
docker build -t leazo-backend ./backend
docker build -t leazo-frontend ./frontend
```

### **Environment Setup**

```bash
# Production environment variables
NODE_ENV=production
MONGODB_URI=mongodb://your-production-db
REDIS_URL=redis://your-production-redis
FRONTEND_URL=https://your-domain.com
```

### **Health Checks**

```bash
# Backend health
curl http://localhost:3001/health

# Database connectivity
curl http://localhost:3001/ready
```

## 📈 Performance & Scaling

### **Caching Strategy**

- **User Data**: 15 minutes TTL
- **Product Catalog**: 10 minutes TTL
- **Search Results**: 5 minutes TTL
- **Static Content**: 1 hour TTL

### **Database Optimization**

- **Compound Indexes**: Optimized for common queries
- **Connection Pooling**: Efficient database connections
- **Query Optimization**: Aggregation pipelines for analytics

### **Background Jobs**

- **Email Notifications**: Async email processing
- **Inventory Updates**: Real-time availability sync
- **Payment Processing**: Webhook handling
- **Report Generation**: Scheduled analytics

## 🔒 Security Features

### **Authentication & Authorization**

- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Session management

### **API Security**

- Rate limiting on sensitive endpoints
- Input validation with Zod schemas
- SQL injection prevention
- XSS protection with Helmet
- CORS configuration

### **Data Protection**

- Encrypted sensitive data
- Secure file upload validation
- PII data handling compliance
- Audit logging

## 🧪 Testing

### **Backend Testing**

```bash
cd backend
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:integration    # Integration tests
```

### **Frontend Testing**

```bash
cd frontend
npm test                    # Run component tests
npm run test:e2e           # End-to-end tests
```

## 📚 Documentation

### **API Documentation**

- Comprehensive API documentation available
- Postman collection included
- OpenAPI/Swagger specification

### **Code Documentation**

- JSDoc comments for all functions
- TypeScript interfaces and types
- Architecture decision records (ADRs)

## 🤝 Contributing

1. **Fork the repository**
2. **Create feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit changes**: `git commit -m 'Add amazing feature'`
4. **Push to branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

### **Development Guidelines**

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow conventional commits
- Ensure code passes linting

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Community

### **Getting Help**

- 📖 **Documentation**: Comprehensive guides and API docs
- 🐛 **Issues**: Report bugs and request features
- 💬 **Discussions**: Community support and questions
- 📧 **Email**: support@leazo.com

### **Roadmap**

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-tenant architecture
- [ ] AI-powered recommendations
- [ ] Blockchain integration for contracts
- [ ] IoT device integration

---

<div align="center">

**Built with ❤️ for the rental economy**

[Website](https://leazo.com) • [Documentation](https://docs.leazo.com) • [API Reference](https://api.leazo.com) • [Community](https://community.leazo.com)

</div>
