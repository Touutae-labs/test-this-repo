import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { IdempotencyService } from './idempotency.service';
import { UserRepository } from '../repositories/user.repository';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { TopupRepository } from '../repositories/topup.repository';
import { TransferRepository } from '../repositories/transfer.repository';

/**
 * Common Module
 * Provides shared services globally:
 * - DatabaseService: SQLite3 database connection and operations
 * - IdempotencyService: Prevents duplicate operations using Bloom filters
 * - Repository classes: Data access layer for each domain entity
 */
@Global()
@Module({
  providers: [
    DatabaseService,
    IdempotencyService,
    UserRepository,
    ApiKeyRepository,
    TransactionRepository,
    TopupRepository,
    TransferRepository,
  ],
  exports: [
    DatabaseService,
    IdempotencyService,
    UserRepository,
    ApiKeyRepository,
    TransactionRepository,
    TopupRepository,
    TransferRepository,
  ],
})
export class CommonModule {}
