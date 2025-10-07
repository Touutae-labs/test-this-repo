# Critical Implementation TODOs

This document outlines the critical parts that need to be implemented to complete the e-wallet backend system.

## 🔴 High Priority - Required Features

### 1. External Payment Service Integration

**File**: `src/topup/topup.service.ts`

#### a. Implement `processExternalTopup()` method

```typescript
private async processExternalTopup(topup: Topup): Promise<void> {
  // TODO: Get external service configuration from environment
  const externalServiceUrl = this.configService.get<string>('EXTERNAL_SERVICE_URL', 'http://localhost:3000');
  const apiKey = this.configService.get<string>('EXTERNAL_API_KEY');

  // TODO: Make API call to external service
  // See external service Swagger docs at http://localhost:3000/doc
  // Example structure:
  // const response = await firstValueFrom(
  //   this.httpService.post(`${externalServiceUrl}/api/topup`, {
  //     topupId: topup.id,
  //     amount: topup.amount,
  //   }, {
  //     headers: {
  //       'x-api-key': apiKey,
  //     },
  //   })
  // );

  // TODO: Handle response and update topup with external transaction ID
  // topup.externalTransactionId = response.data.transactionId;
}
```

#### b. Implement `handleWebhook()` method

```typescript
async handleWebhook(payload: any, signature?: string): Promise<void> {
  // TODO: 1. Verify webhook signature for security
  const isValid = this.verifyWebhookSignature(payload, signature);
  if (!isValid) {
    throw new BadRequestException('Invalid webhook signature');
  }

  // TODO: 2. Extract topup ID and status from webhook payload
  const { topupId, status, externalTransactionId } = payload;

  // TODO: 3. Find topup in database
  const topup = this.databaseService.findTopupById(topupId);
  if (!topup) {
    throw new NotFoundException('Top-up not found');
  }

  // TODO: 4. Update topup status based on webhook data
  if (status === 'SUCCESS') {
    await this.completeTopup(topupId, externalTransactionId);
  } else if (status === 'FAILED') {
    topup.status = TopupStatus.FAILED;
    topup.updatedAt = new Date();
    this.databaseService.saveTopup(topup);
  }
}
```

#### c. Implement `verifyWebhookSignature()` method

```typescript
private verifyWebhookSignature(payload: any, signature: string): boolean {
  // TODO: Get webhook secret from environment
  const webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');
  
  // TODO: Implement HMAC-SHA256 signature verification
  // Example:
  // const crypto = require('crypto');
  // const expectedSignature = crypto
  //   .createHmac('sha256', webhookSecret)
  //   .update(JSON.stringify(payload))
  //   .digest('hex');
  // return expectedSignature === signature;
  
  return false; // FIXME: Implement actual verification
}
```

### 2. Transfer Validation Enhancement

**File**: `src/transfer/transfer.service.ts`

```typescript
private validateTransfer(senderBalance: number, amount: number): void {
  // Current: Basic validation exists
  
  // TODO: Add minimum transfer amount
  const MIN_TRANSFER_AMOUNT = 1;
  if (amount < MIN_TRANSFER_AMOUNT) {
    throw new BadRequestException(`Minimum transfer amount is ${MIN_TRANSFER_AMOUNT}`);
  }

  // TODO: Add maximum transfer amount
  const MAX_TRANSFER_AMOUNT = 10000;
  if (amount > MAX_TRANSFER_AMOUNT) {
    throw new BadRequestException(`Maximum transfer amount is ${MAX_TRANSFER_AMOUNT}`);
  }

  // TODO: Add daily transfer limit check
  // Query total transfers for today and check against limit
  
  // TODO: Add monthly transfer limit check
  // Query total transfers for this month and check against limit
  
  // TODO: Add fraud detection
  // Check for suspicious patterns (too many transfers, unusual amounts, etc.)
}
```

## 🟡 Medium Priority - Infrastructure

### 3. Database Layer Replacement

**File**: `src/common/database.service.ts`

**Current**: In-memory storage (data lost on restart)

**TODO**: Replace with a real database

#### Option A: PostgreSQL with TypeORM

```bash
npm install @nestjs/typeorm typeorm pg
```

Create entity files and configure TypeORM in `app.module.ts`

#### Option B: MongoDB with Mongoose

```bash
npm install @nestjs/mongoose mongoose
```

Convert entities to Mongoose schemas

#### Option C: Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

Create Prisma schema and generate client

#### Implementation Steps:

1. Choose and install database dependencies
2. Create database entities/models
3. Set up database connection in `app.module.ts`
4. Replace `DatabaseService` methods with actual database queries
5. Add database migrations
6. Add proper indexes for performance
7. Implement database transactions for atomic operations

### 4. Authentication Enhancement

**File**: `src/common/guards/auth.guard.ts` and `src/users/users.service.ts`

**Current**: Simple API key authentication

**TODO**: Implement JWT-based authentication

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
npm install -D @types/passport-jwt
```

#### Implementation Steps:

1. Create JWT strategy and auth module
2. Update login to return JWT token instead of API key
3. Implement token refresh mechanism
4. Add token expiration handling
5. Update AuthGuard to validate JWT tokens
6. Consider adding refresh tokens

## 🟢 Low Priority - Enhancements

### 5. Additional Features

#### a. Rate Limiting

```bash
npm install @nestjs/throttler
```

Add rate limiting to prevent abuse

#### b. Logging and Monitoring

```bash
npm install winston nest-winston
```

Implement structured logging

#### c. API Documentation

```bash
npm install @nestjs/swagger
```

Add Swagger/OpenAPI documentation

#### d. Input Validation Enhancement

- Add more comprehensive validation rules
- Add custom validators for business rules
- Add input sanitization

#### e. Error Handling

- Implement custom exception filters
- Add proper error codes and messages
- Add error logging

#### f. Testing

- Write unit tests for services
- Write integration tests for controllers
- Write e2e tests for API endpoints
- Add test coverage reporting

### 6. Security Enhancements

- Add helmet for security headers
- Add CORS configuration for production
- Add request ID tracking
- Add audit logging
- Implement 2FA support
- Add password reset functionality
- Add email verification

### 7. Performance Optimization

- Add caching (Redis)
- Add database connection pooling
- Add query optimization
- Add pagination for list endpoints
- Add bulk operations support

## 📝 Testing Checklist

Before considering the implementation complete, test:

- [ ] User registration with various inputs
- [ ] User login with correct/incorrect credentials
- [ ] Balance viewing for authenticated users
- [ ] Top-up flow with external service
- [ ] Webhook processing with valid/invalid signatures
- [ ] Money transfer with sufficient/insufficient balance
- [ ] Transfer to non-existent user
- [ ] Transfer to self (should fail)
- [ ] Transaction history retrieval
- [ ] API authentication with valid/invalid keys
- [ ] Input validation (negative amounts, empty fields, etc.)
- [ ] Concurrent transfer requests (race conditions)
- [ ] Large balance values (overflow testing)

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Replace in-memory database with persistent storage
- [ ] Configure environment variables properly
- [ ] Set up database backups
- [ ] Implement proper logging
- [ ] Set up monitoring and alerting
- [ ] Add health check endpoints
- [ ] Configure rate limiting
- [ ] Set up HTTPS/TLS
- [ ] Review and test security measures
- [ ] Load test the application
- [ ] Set up CI/CD pipeline
- [ ] Prepare rollback strategy

## 📚 Resources

- [NestJS Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- External Service Swagger: `http://localhost:3000/doc`

---

**Note**: Search for `// CRITICAL:` and `// TODO:` comments in the codebase for inline implementation hints.
