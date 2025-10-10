# E-Wallet Backend - Setup and Usage Guide

## ✅ Project Status

The E-Wallet backend is now **fully implemented** with:
- ✅ User registration and authentication with API keys
- ✅ Balance management with transaction history
- ✅ Money transfers between users with atomic transactions
- ✅ **Top-up functionality with external service integration**
- ✅ **Webhook handling with signature verification and idempotency**
- ✅ TypeORM integration with SQLite database
- ✅ Proper entity relationships and database migrations

## 🚀 Getting Started

### 1. Installation

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory (or use the provided one):

```env
# Application Configuration
PORT=8080
NODE_ENV=development

# External Payment Service Configuration
EXTERNAL_SERVICE_URL=http://localhost:3000
EXTERNAL_API_KEY=your-api-key
WEBHOOK_SECRET=your-webhook-secret
```

**Important**: 
- Update `EXTERNAL_API_KEY` and `WEBHOOK_SECRET` to match your external service configuration
- The application runs on port 8080 to avoid conflict with the external service on port 3000

### 3. Start the External Service

The external payment service must be running for top-up functionality:

```bash
# Start the external service using docker-compose
docker-compose up -d

# Check if it's running
curl http://localhost:3000/doc
```

Update the docker-compose.yml environment variables:
```yaml
environment:
  - WEBHOOK_URL=http://host.docker.internal:8080/topup/webhook
  - WEBHOOK_SECRET=your-webhook-secret
  - API_KEY=your-api-key
  - SUCCESS_TOPUP_STATUS_RATE=0.9
  - IGNORE_WEBHOOK_RATE=0.1
```

### 4. Start the Application

```bash
# Development mode with hot reload
npm run start:dev

# Or build and run in production mode
npm run build
npm run start:prod
```

The application will be available at `http://localhost:8080`

## 📝 API Endpoints

### 1. User Management

#### Register a New User
```bash
POST /users/register
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}

Response:
{
  "user": {
    "id": "uuid",
    "username": "john_doe",
    "balance": 0,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "apiKey": "ewallet_xxxxxxxxxxxxx"
}
```

#### Login
```bash
POST /users/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}

Response: Same as registration
```

#### Get Profile
```bash
GET /users/me
x-api-key: ewallet_xxxxxxxxxxxxx

Response:
{
  "id": "uuid",
  "username": "john_doe",
  "balance": 1000.00,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### 2. Balance Management

#### Get Current Balance
```bash
GET /balance
x-api-key: ewallet_xxxxxxxxxxxxx

Response:
{
  "userId": "uuid",
  "balance": 1000.00
}
```

#### Get Transaction History
```bash
GET /balance/history
x-api-key: ewallet_xxxxxxxxxxxxx

Response:
[
  {
    "id": "uuid",
    "userId": "uuid",
    "amount": 500.00,
    "type": "TOPUP",
    "balanceBefore": 500.00,
    "balanceAfter": 1000.00,
    "description": "Top-up: 500",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

### 3. Top-up Functionality

#### Create Top-up Request
```bash
POST /topup
x-api-key: ewallet_xxxxxxxxxxxxx
Content-Type: application/json

{
  "amount": 500.00
}

Response:
{
  "id": "uuid",
  "userId": "uuid",
  "amount": 500.00,
  "status": "PENDING",
  "externalTransactionId": "ext_uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Note**: The top-up will be sent to the external service. The balance will be updated when the webhook is received.

#### Get Top-up History
```bash
GET /topup/history
x-api-key: ewallet_xxxxxxxxxxxxx

Response:
[
  {
    "id": "uuid",
    "userId": "uuid",
    "amount": 500.00,
    "status": "SUCCESS",
    "externalTransactionId": "ext_uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Webhook Endpoint (Called by External Service)
```bash
POST /topup/webhook
x-webhook-signature: <hmac-sha256-signature>
Content-Type: application/json

{
  "requestId": "ext_uuid",
  "referenceId": "topup_uuid",
  "status": "completed",
  "amount": 500.00,
  "currency": "THB",
  "processedAt": "2024-01-01T00:00:00.000Z"
}

Response:
{
  "success": true
}
```

**Security**: 
- The webhook signature is verified using HMAC-SHA256
- Idempotency is enforced to prevent duplicate processing

### 4. Money Transfer

#### Transfer Money
```bash
POST /transfer
x-api-key: ewallet_xxxxxxxxxxxxx
Content-Type: application/json

{
  "recipientUsername": "jane_doe",
  "amount": 100.00
}

Response:
{
  "id": "uuid",
  "fromUserId": "uuid",
  "toUserId": "uuid",
  "amount": 100.00,
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### Get Transfer History
```bash
GET /transfer/history
x-api-key: ewallet_xxxxxxxxxxxxx

Response:
[
  {
    "id": "uuid",
    "fromUserId": "uuid",
    "toUserId": "uuid",
    "amount": 100.00,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

## 🔒 Security Features

### 1. Authentication
- API key-based authentication
- API keys expire after 30 days
- Passwords are hashed using bcrypt with 10 salt rounds

### 2. Webhook Security
- HMAC-SHA256 signature verification
- Signature format: `sha256(JSON.stringify(payload), WEBHOOK_SECRET)`
- Invalid signatures are rejected

### 3. Idempotency
- Webhooks are tracked to prevent duplicate processing
- Database transactions ensure atomicity for balance updates

### 4. Input Validation
- All inputs are validated using class-validator
- DTOs enforce type safety and required fields

## 🗄️ Database

The application uses **SQLite** as the database (file: `database.sqlite`):
- Automatically created on first run
- Schema is synchronized automatically (synchronize: true)
- Entities: User, ApiKey, Topup, Transfer, Transaction

To reset the database:
```bash
rm database.sqlite
# Restart the application
```

## 🧪 Testing

### Manual Testing with curl

1. Register a user:
```bash
curl -X POST http://localhost:8080/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"password123"}'
```

2. Use the returned API key for authenticated requests:
```bash
API_KEY="ewallet_xxxxxxxxxxxxx"

# Check balance
curl -X GET http://localhost:8080/balance \
  -H "x-api-key: $API_KEY"

# Create top-up
curl -X POST http://localhost:8080/topup \
  -H "x-api-key: $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"amount":1000}'
```

### Testing with the Provided HTTP File

The repository includes `api-tests.http` file for testing with REST Client extensions in VS Code or IntelliJ.

## 📊 Architecture

### Key Components

1. **Common Module**
   - AuthGuard: API key authentication
   - CurrentUser decorator: Extract user ID from requests
   - ApiKey entity: Store API keys

2. **Users Module**
   - User registration and login
   - Password hashing and validation
   - API key generation

3. **Balance Module**
   - View balance
   - Transaction history

4. **Topup Module**
   - Create top-up requests
   - External service integration
   - Webhook handling with signature verification

5. **Transfer Module**
   - Money transfers between users
   - Atomic database transactions

### Database Transactions

Both transfer and top-up completion use TypeORM transactions with pessimistic locking:
```typescript
await this.dataSource.transaction(async (manager) => {
  const user = await manager.findOne(User, {
    where: { id: userId },
    lock: { mode: 'pessimistic_write' }
  });
  // ... update balance atomically
});
```

## 🐛 Troubleshooting

### Issue: External service not accessible
- Ensure docker-compose is running: `docker-compose ps`
- Check external service logs: `docker-compose logs backend-interview`
- Verify WEBHOOK_URL is accessible from the container

### Issue: Webhooks not working
- Check WEBHOOK_SECRET matches in both services
- Verify the external service can reach your webhook URL
- Check application logs for signature verification errors

### Issue: Database errors
- Delete `database.sqlite` and restart
- Check for file permissions
- Ensure no other process is using the database file

## 📝 Notes

- The application uses SQLite for simplicity, but can be easily switched to PostgreSQL/MySQL
- Idempotency for webhooks uses an in-memory Set (for production, use Redis or database)
- API keys are simple UUID-based keys (for production, consider JWT tokens)
- Transfer validation is basic (add limits, fraud detection as needed)

## 🎉 Done!

The E-Wallet backend is ready for:
- User registration and authentication
- Balance checking and transaction history
- Money transfers between users
- Top-ups via external payment service
- Webhook processing with security and idempotency

All critical functionality has been implemented following NestJS best practices with TypeORM!
