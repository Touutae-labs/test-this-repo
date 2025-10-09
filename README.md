# E-Wallet Backend Service

A NestJS-based e-wallet backend system implementing user management, balance tracking, top-up functionality, and money transfers.

## 🎯 Project Status

This project provides a **scaffold implementation** with the core structure and basic functionality in place. **Critical business logic components are marked with TODO comments** for you to implement.

## ✅ Implemented Features

### 1. 👤 User Management
- ✅ User registration endpoint
- ✅ User login endpoint  
- ✅ Simple API key authentication
- ✅ Password hashing with bcrypt
- 🔶 **CRITICAL**: Enhance authentication (JWT, session management, etc.)

### 2. 💰 Balance Management
- ✅ View current balance endpoint
- ✅ Transaction history tracking
- ✅ In-memory database for quick testing
- 🔶 **CRITICAL**: Implement proper database persistence

### 3. 💳 Top-up Functionality
- ✅ Top-up request endpoint structure
- ✅ Webhook endpoint for external service
- ✅ Top-up status tracking
- ✅ Idempotency examples for webhooks (see code comments)
- 🔶 **CRITICAL**: Implement external service integration (`processExternalTopup`)
- 🔶 **CRITICAL**: Implement webhook processing logic (`handleWebhook`)
- 🔶 **CRITICAL**: Implement webhook signature verification (`verifyWebhookSignature`)

### 4. 🔄 Money Transfer
- ✅ Transfer endpoint with basic validation
- ✅ Transfer history tracking
- ✅ Transaction recording for both parties
- ✅ Idempotency examples (see code comments)
- 🔶 **CRITICAL**: Implement comprehensive validation (limits, fraud detection)
- 🔶 **CRITICAL**: Implement proper database transactions (see DATABASE_SETUP.md)

## 🔧 Technology Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Runtime**: Node.js 20.x
- **Validation**: class-validator, class-transformer
- **HTTP Client**: @nestjs/axios
- **Password Hashing**: bcrypt
- **Idempotency**: Bloom filters (bloom-filters package)
- **Database**: In-memory (TypeORM/Prisma setup guide provided)

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

**📚 For detailed setup and testing instructions, see [SETUP.md](./SETUP.md)**

## 🎉 NEW: Idempotency & Database Setup

### ✅ Idempotency Service (Fully Implemented)

**File**: `src/common/idempotency.service.ts`

Complete idempotency implementation using Bloom filters:
- Fast duplicate detection (10,000 ops/day capacity)
- Prevents duplicate webhooks, transfers, and top-ups
- TTL support (24 hours)
- Ready to use - see inline examples in service files

### ✅ Database Setup Guide (Complete)

**File**: `DATABASE_SETUP.md`

Comprehensive guide with:
- Complete TypeORM implementation (all entities with decorators)
- Alternative Prisma setup
- Transaction management examples
- Docker Compose with PostgreSQL
- Migration strategy for production

**Quick Start**:
```bash
npm install @nestjs/typeorm typeorm pg
docker-compose up -d postgres
# Follow DATABASE_SETUP.md
```

## 📋 What You Need to Implement

Look for `// CRITICAL:` comments throughout the codebase. Key areas:

### 1. External Service Integration (`src/topup/topup.service.ts`)

```typescript
// CRITICAL: Implement external service call
private async processExternalTopup(topup: Topup): Promise<void> {
  // TODO: Make API call to external service
  // TODO: Handle response
}

// CRITICAL: Implement webhook processing logic  
async handleWebhook(payload: any, signature?: string): Promise<void> {
  // TODO: Verify webhook signature
  // TODO: Process webhook data
  // TODO: Update topup status
  // TODO: Update user balance
}
```

### 2. Transfer Validation (`src/transfer/transfer.service.ts`)

```typescript
// CRITICAL: Implement comprehensive validation
private validateTransfer(senderBalance: number, amount: number): void {
  // TODO: Add minimum transfer amount check
  // TODO: Add maximum transfer amount check
  // TODO: Add daily/monthly limit check
  // TODO: Add fraud detection logic
}
```

### 3. Database Layer (`src/common/database.service.ts`)

✅ **SOLUTION PROVIDED** - See `DATABASE_SETUP.md`

Complete implementation guide with:
- TypeORM entities with decorators
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
