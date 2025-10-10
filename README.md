# E-Wallet Backend Service

> Backend Engineer Exam Implementation for Mr. Roney Jae's fintech ecosystem

## Quick Setup

1. `docker-compose up -d` - Start external payment service
2. `npm install` - Install dependencies  
3. `npm run start:dev` - Start development server
4. Import Postman collection: `E-Wallet POC API Collection 🚀.postman_collection.json`

## Implementation Checklist

### ✅ Required Features Completed

**👤 User Management [REQUIRED]**
- ✅ User Registration (`POST /users/register`)
- ✅ User Login (`POST /users/login`) 
- ✅ Authentication via API Keys

**💰 Balance Management [REQUIRED]**
- ✅ View Balance (`GET /balance`)
- ✅ Balance History [OPTIONAL] (`GET /balance/history`)

**💳 Top-up Functionality [REQUIRED]**
- ✅ External Service Integration (`POST /topup`)
- ✅ Webhook Handler (`POST /topup/webhook`)
- ✅ Transaction Recording [OPTIONAL] (`GET /topup/history`)

**� Money Transfer [REQUIRED]** 
- ✅ Transfer Money (`POST /transfer`)
- ✅ Transfer Validation (balance & recipient checks)
- ✅ Transfer History [OPTIONAL] (`GET /transfer/history`)

## Technical Implementation

**Framework:** NestJS + TypeScript  
**Database:** SQLite with TypeORM  
**Authentication:** Custom API Key system

## Developer Notes & Design Decisions

### Why Normal NPM Dev Setup ? Instead of Docker ?
- Avoids Docker SQLite3 binary driver inside Container (I have limited time doing this assignment during Relocation)

### Idempotency Limitation
- Currently uses in-memory storage for webhook deduplication
- Production improvement: Implement Redis-based idempotency keys for user registration and transfers

### SQLite Row Locking  
- SQLite doesn't support row-level locking (pessimistic_write)
- Prevents proper race condition protection during concurrent transfers
- Production improvement: Migrate to PostgreSQL for proper transaction isolation

### Implementation Status
- ✅ All required features from instruction.md completed
- ✅ API satisfies exam requirements 
- ✅ External service integration working
- ✅ Comprehensive Postman test scenarios included ( Some is AI generated and it could lead to confusion please check at Complete E2E Journey and double check again)

**This implementation demonstrates all required functionality and is ready for evaluation.**