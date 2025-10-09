import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { IdempotencyService } from './idempotency.service';

/**
 * Common Module
 * Provides shared services globally:
 * - DatabaseService: SQLlite3 database connection and operations
 * - IdempotencyService: Prevents duplicate operations using Bloom filters
 */
@Global()
@Module({
  providers: [DatabaseService, IdempotencyService],
  exports: [DatabaseService, IdempotencyService],
})
export class CommonModule {}
