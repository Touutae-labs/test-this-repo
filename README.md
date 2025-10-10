# E-Wallet Backend Service

A NestJS-based e-wallet backend system implementing user management, balance tracking, top-up functionality, and money transfers.

## 🎯 Project Status

✅ **FULLY IMPLEMENTED** - All core features are complete and functional!

## ✅ Implemented Features

### 1. 👤 User Management
- ✅ User registration endpoint
- ✅ User login endpoint  
- ✅ API key authentication with AuthGuard
- ✅ Password hashing with bcrypt
- ✅ API key expiration (30 days)

### 2. 💰 Balance Management
- ✅ View current balance endpoint
- ✅ Transaction history tracking
- ✅ TypeORM integration with SQLite database
- ✅ Proper entity relationships and migrations

### 3. 💳 Top-up Functionality
- ✅ Top-up request endpoint
- ✅ Webhook endpoint for external service
- ✅ Top-up status tracking
- ✅ **External service integration with HTTP calls**
- ✅ **Webhook processing logic with idempotency**
- ✅ **HMAC-SHA256 webhook signature verification**
- ✅ **Atomic database transactions for balance updates**

### 4. 🔄 Money Transfer
- ✅ Transfer endpoint with validation
- ✅ Transfer history tracking
- ✅ Transaction recording for both parties
- ✅ **Atomic database transactions with pessimistic locking**
- ✅ **Comprehensive validation (balance, recipient, self-transfer)**

## 🔧 Technology Stack

- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Runtime**: Node.js 20.x
- **Database**: TypeORM with SQLite
- **Validation**: class-validator, class-transformer
- **HTTP Client**: @nestjs/axios with RxJS
- **Password Hashing**: bcrypt (10 salt rounds)
- **Authentication**: API key-based with expiration
- **Signature Verification**: HMAC-SHA256 for webhooks

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Docker and Docker Compose (for external service)

### Installation

```bash
# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start external payment service
docker-compose up -d backend-interview

# Start the application
npm run start:dev
```

The application will be available at `http://localhost:8080`

**📚 Documentation:**
- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - **Complete setup guide and API documentation**
- [instruction.md](./instruction.md) - Original project requirements
- [api-tests.http](./api-tests.http) - Ready-to-use HTTP requests for testing

## 🎉 Implementation Highlights

### ✅ TypeORM Database Integration

The project uses **TypeORM with SQLite** for data persistence:
- All entities properly decorated (@Entity, @Column, etc.)
- Automatic schema synchronization
- Support for database transactions with pessimistic locking
- Entities: User, ApiKey, Topup, Transfer, Transaction

### ✅ External Service Integration

**File**: `src/topup/topup.service.ts`

Complete implementation with:
- HTTP client integration using @nestjs/axios
- API calls to external payment service
- Request/response handling with proper error management
- External transaction ID tracking

### ✅ Webhook Processing

**File**: `src/topup/topup.service.ts`

Complete webhook handling:
- HMAC-SHA256 signature verification
- Idempotency tracking to prevent duplicate processing
- Automatic balance updates on successful topup
- Transaction recording for audit trail

### ✅ Atomic Transactions

Both transfer and topup services use database transactions:
```typescript
await this.dataSource.transaction(async (manager) => {
  const user = await manager.findOne(User, {
    where: { id: userId },
    lock: { mode: 'pessimistic_write' }
  });
  // ... atomic balance updates
});
```

## 🔐 Security Features

1. **API Key Authentication**: Custom AuthGuard with expiration checking
2. **Password Hashing**: bcrypt with 10 salt rounds
3. **Webhook Signature Verification**: HMAC-SHA256
4. **Input Validation**: class-validator on all DTOs
5. **Pessimistic Locking**: Prevents race conditions in transfers
6. **Idempotency**: Prevents duplicate webhook processing
- Database connection setup
- Transaction examples
- Migration strategy
- Docker Compose configuration

Follow the guide to replace in-memory storage with PostgreSQL/MySQL.

### 4. Authentication (`src/common/guards/auth.guard.ts`)

```typescript
// CRITICAL: Implement proper authentication mechanism
// - Consider JWT tokens instead of simple API keys
// - Add token expiration
// - Add refresh token mechanism
```

## 🏗️ Project Structure

```
src/
├── users/              # User management module
│   ├── dto/           # Data transfer objects
│   ├── entities/      # User entity
│   ├── users.controller.ts
│   └── users.service.ts
├── balance/           # Balance management module
│   ├── dto/
│   ├── entities/      # Transaction entity
│   ├── balance.controller.ts
│   └── balance.service.ts
├── topup/             # Top-up functionality module
│   ├── dto/
│   ├── entities/      # Topup entity
│   ├── topup.controller.ts
│   └── topup.service.ts  ⚠️ CRITICAL IMPLEMENTATION NEEDED
├── transfer/          # Money transfer module
│   ├── dto/
│   ├── entities/      # Transfer entity
│   ├── transfer.controller.ts
│   └── transfer.service.ts  ⚠️ CRITICAL IMPLEMENTATION NEEDED
├── common/
│   ├── guards/        # Auth guard
│   ├── decorators/    # Custom decorators
│   └── database.service.ts  ⚠️ REPLACE WITH REAL DB
└── main.ts
```

## 🔐 API Authentication

All authenticated endpoints require the `x-api-key` header:

```bash
curl -H "x-api-key: YOUR_API_KEY" http://localhost:8080/balance
```

## 📚 API Documentation

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/users/register` | POST | No | Register new user |
| `/users/login` | POST | No | Login user |
| `/users/me` | GET | Yes | Get user profile |
| `/balance` | GET | Yes | Get current balance |
| `/balance/history` | GET | Yes | Get transaction history |
| `/topup` | POST | Yes | Create top-up request |
| `/topup/webhook` | POST | No | Webhook for external service |
| `/topup/history` | GET | Yes | Get top-up history |
| `/transfer` | POST | Yes | Transfer money |
| `/transfer/history` | GET | Yes | Get transfer history |

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📖 Original Requirements

For the complete exam requirements, see:
- [instruction.md](./instruction.md) - Full exam instructions
- [SETUP.md](./SETUP.md) - Detailed setup guide

## 🚨 Important Notes

1. **This is a scaffold**: The critical business logic needs to be implemented
2. **In-memory database**: Replace with proper database for production
3. **Security**: Enhance authentication and add rate limiting
4. **External service**: Complete the integration with the provided external payment service
5. **Validation**: Add comprehensive input validation and business rule enforcement

## 🤖 AI Assistance Policy

This code was scaffolded with AI assistance. You are responsible for:
- Understanding all code in this project
- Implementing the critical parts marked with TODO/CRITICAL comments
- Testing and validating the implementation
- Ensuring security and production readiness

## 📝 License

This is an exam project for educational purposes.
