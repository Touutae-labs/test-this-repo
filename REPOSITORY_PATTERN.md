# Repository Pattern Implementation

## Overview

This document describes the repository pattern implementation in the e-wallet service. The repository layer has been separated from the `DatabaseService` to provide better separation of concerns and maintainability.

## Architecture

### Before (Monolithic DatabaseService)

Previously, all database operations were contained in a single `DatabaseService` class:

```
DatabaseService
├── User operations (findUserById, saveUser, etc.)
├── API Key operations (findUserIdByApiKey, saveApiKey, etc.)
├── Transaction operations (findTransactionsByUserId, saveTransaction, etc.)
├── Topup operations (findTopupById, saveTopup, etc.)
└── Transfer operations (findTransfersByUserId, saveTransfer, etc.)
```

### After (Repository Pattern)

Now, each domain entity has its own repository:

```
DatabaseService (Connection Manager)
├── UserRepository
├── ApiKeyRepository
├── TransactionRepository
├── TopupRepository
└── TransferRepository
```

## Repository Classes

### 1. UserRepository (`src/repositories/user.repository.ts`)

Handles all user-related database operations:
- `save(user: User)` - Create or update a user
- `findById(id: string)` - Find user by ID
- `findByUsername(username: string)` - Find user by username

### 2. ApiKeyRepository (`src/repositories/api-key.repository.ts`)

Handles API key management:
- `save(apiKey: string, userId: string, expiresAt: Date)` - Store API key
- `findUserIdByApiKey(apiKey: string)` - Validate API key and get user ID
- `delete(apiKey: string)` - Remove API key
- `cleanupExpired()` - Remove expired API keys

### 3. TransactionRepository (`src/repositories/transaction.repository.ts`)

Handles transaction history:
- `save(transaction: Transaction)` - Record a transaction
- `findByUserId(userId: string)` - Get user's transaction history

### 4. TopupRepository (`src/repositories/topup.repository.ts`)

Handles top-up operations:
- `save(topup: Topup)` - Store top-up record
- `findById(id: string)` - Find top-up by ID
- `findByUserId(userId: string)` - Get user's top-up history
- `findByIdempotencyKey(key: string)` - Find top-up by idempotency key

### 5. TransferRepository (`src/repositories/transfer.repository.ts`)

Handles money transfers:
- `save(transfer: Transfer)` - Store transfer record
- `findByUserId(userId: string)` - Get user's transfer history
- `findByIdempotencyKey(key: string)` - Find transfer by idempotency key

## DatabaseService

The `DatabaseService` now acts as a lightweight connection manager:

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  // Repository instances
  public userRepository: UserRepository;
  public apiKeyRepository: ApiKeyRepository;
  public transactionRepository: TransactionRepository;
  public topupRepository: TopupRepository;
  public transferRepository: TransferRepository;

  // Initializes database connection and creates repository instances
  async onModuleInit() { ... }
}
```

## Usage in Services

Services access repositories through the `DatabaseService`:

```typescript
// Before
const user = this.databaseService.findUserById(userId);
await this.databaseService.saveUser(user);

// After
const user = await this.databaseService.userRepository.findById(userId);
await this.databaseService.userRepository.save(user);
```

## Benefits

1. **Separation of Concerns**: Each repository focuses on one domain entity
2. **Maintainability**: Easier to locate and modify data access code
3. **Testability**: Repositories can be easily mocked in unit tests
4. **Extensibility**: New repositories can be added without modifying existing code
5. **Clear API**: Repository methods are clearly scoped to their domain

## Testing

A `MockDatabaseService` class is provided for testing (`src/common/test-helpers/mock-database.service.ts`):

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    YourService,
    {
      provide: DatabaseService,
      useClass: MockDatabaseService,
    },
  ],
}).compile();
```

## Future Improvements

The repository pattern provides a foundation for:
- **Database Transactions**: Implement atomic operations across repositories
- **Caching Layer**: Add caching at the repository level
- **Query Builder**: Add more sophisticated query methods
- **Database Migrations**: Easier to manage schema changes per repository
- **Multiple Data Sources**: Swap implementations for different databases
