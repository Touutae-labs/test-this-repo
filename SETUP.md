# E-Wallet Backend Setup Guide

This guide will help you set up and run the e-wallet backend service.

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker and Docker Compose (for external service)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Update the values in `.env` as needed:

```env
PORT=8080
EXTERNAL_SERVICE_URL=http://localhost:3000
EXTERNAL_API_KEY=your-api-key
WEBHOOK_SECRET=your-webhook-secret
```

### 3. Start the External Payment Service

The external service is required for top-up functionality:

```bash
docker-compose up -d backend-interview
```

Access the Swagger documentation at: http://localhost:3000/doc

### 4. Start the E-Wallet Backend

```bash
# Development mode with hot-reload
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The backend will be available at: http://localhost:8080

## 🧪 Testing the API

### Quick Testing with .http File

**NEW**: Use the provided `api-tests.http` file for easy manual testing!

1. Install **REST Client** extension for VS Code
2. Open `api-tests.http`
3. Click "Send Request" above any request

**See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for complete testing instructions.**

### Manual Testing with cURL

### 1. Register a User

```bash
curl -X POST http://localhost:8080/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

Response:
```json
{
  "user": {
    "id": "...",
    "username": "john_doe",
    "balance": 0,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "apiKey": "ewallet_..."
}
```

**Save the API key** - you'll need it for authenticated requests!

### 2. Login

```bash
curl -X POST http://localhost:8080/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

### 3. Check Balance

```bash
curl -X GET http://localhost:8080/balance \
  -H "x-api-key: YOUR_API_KEY"
```

### 4. Top-up Balance

```bash
curl -X POST http://localhost:8080/topup \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "amount": 100
  }'
```

### 5. Transfer Money

First, register another user, then:

```bash
curl -X POST http://localhost:8080/transfer \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "recipientUsername": "another_user",
    "amount": 50
  }'
```

## 📚 API Endpoints

### User Management
- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `GET /users/me` - Get current user profile (requires auth)

### Balance Management
- `GET /balance` - Get current balance (requires auth)
- `GET /balance/history` - Get transaction history (requires auth)

### Top-up
- `POST /topup` - Create top-up request (requires auth)
- `POST /topup/webhook` - Webhook endpoint for external service (no auth)
- `GET /topup/history` - Get top-up history (requires auth)

### Transfer
- `POST /transfer` - Transfer money to another user (requires auth)
- `GET /transfer/history` - Get transfer history (requires auth)

## 🔐 Authentication

All authenticated endpoints require the `x-api-key` header:

```
x-api-key: ewallet_...
```

The API key is returned when you register or login.

## ⚠️ Important Notes

### In-Memory Database

The current implementation uses an in-memory database. Data will be lost when the application restarts. For production, you should:

1. Choose a database (PostgreSQL, MySQL, MongoDB, etc.)
2. Set up database connection
3. Replace DatabaseService with proper ORM (TypeORM, Prisma, Mongoose, etc.)

### Critical Parts to Implement

The following features have placeholders and require implementation:

1. **External Service Integration** (`src/topup/topup.service.ts`):
   - `processExternalTopup()` - Integrate with external payment service API
   - `handleWebhook()` - Process webhook notifications
   - `verifyWebhookSignature()` - Verify webhook authenticity

2. **Transfer Validation** (`src/transfer/transfer.service.ts`):
   - Add transfer limits (daily/monthly)
   - Add minimum/maximum transfer amounts
   - Add fraud detection

3. **Authentication** (`src/common/guards/auth.guard.ts`):
   - Consider JWT tokens instead of API keys
   - Add token expiration
   - Add refresh token mechanism

4. **Database** (`src/common/database.service.ts`):
   - Replace in-memory storage with real database
   - Add database transactions for atomicity
   - Add proper indexes and constraints

Look for `// CRITICAL:` comments in the code for specific implementation points.

## 🐳 Docker Deployment

A Dockerfile can be added for containerization:

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 8080

CMD ["node", "dist/main"]
```

Then uncomment the `e-wallet-backend` service in `docker-compose.yml`.

## 🧹 Development

```bash
# Run in watch mode
npm run start:dev

# Run tests
npm run test

# Run e2e tests
npm run test:e2e

# Lint
npm run lint

# Format code
npm run format
```

## 📝 License

This is an exam project for educational purposes.
