# Repository Pattern Implementation

## Overview

This document describes the repository pattern implementation in the e-wallet service. The repository layer has been properly separated using dependency injection, following NestJS best practices and SOLID principles.

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

### After (Repository Pattern with Proper DI)

Now, each domain entity has its own repository that injects DatabaseService:

```
DatabaseService (Connection Provider)
├── Provides: get(), all(), run(), getDatabase()
└── Used by: ↓

Repositories (NestJS Providers)
├── UserRepository (injects DatabaseService)
├── ApiKeyRepository (injects DatabaseService)
├── TransactionRepository (injects DatabaseService)
├── TopupRepository (injects DatabaseService)
└── TransferRepository (injects DatabaseService)
    └── Injected into: ↓

Services (Business Logic)
├── UsersService (injects UserRepository, ApiKeyRepository)
├── BalanceService (injects UserRepository, TransactionRepository)
├── TopupService (injects UserRepository, TopupRepository, TransactionRepository)
└── TransferService (injects UserRepository, TransferRepository, TransactionRepository)
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

The `DatabaseService` now acts as a lightweight connection provider:

```typescript
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  // Provides database access methods
  async get(sql: string, params?: any[]): Promise<any> { ... }
  async all(sql: string, params?: any[]): Promise<any[]> { ... }
  async run(sql: string, params?: any[]): Promise<sqlite3.RunResult> { ... }
  getDatabase(): sqlite3.Database { ... }
}
```

## Repository Implementation

Each repository is a NestJS provider that injects DatabaseService:

```typescript
@Injectable()
export class TopupRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async save(topup: Topup): Promise<Topup> {
    await this.databaseService.run(
      'INSERT OR REPLACE INTO topups (...) VALUES (...)',
      [/* params */]
    );
    return topup;
  }

  async findById(id: string): Promise<Topup | undefined> {
    const row = await this.databaseService.get(
      'SELECT * FROM topups WHERE id = ?',
      [id]
    );
    return row ? this.mapRowToTopup(row) : undefined;
  }
}
```

## Usage in Services

Services inject repositories directly:

```typescript
// Before
constructor(private readonly databaseService: DatabaseService) {}
const user = await this.databaseService.userRepository.findById(userId);

// After - Proper Dependency Injection
constructor(
  private readonly userRepository: UserRepository,
  private readonly topupRepository: TopupRepository,
) {}
const user = await this.userRepository.findById(userId);
await this.topupRepository.save(topup);
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
    YourRepository,  // Include the repository
    {
      provide: DatabaseService,
      useClass: MockDatabaseService,  // Mock provides get, all, run methods
    },
  ],
}).compile();
```

Example test setup:

```typescript
const module: TestingModule = await Test.createTestingModule({
  providers: [
    TopupService,
    UserRepository,
    TopupRepository,
    TransactionRepository,
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
