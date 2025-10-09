import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { IdempotencyService } from './idempotency.service';

/**
 * Common Module
 * Provides shared services globally:
 * - DatabaseService: In-memory storage (replace with TypeORM - see DATABASE_SETUP.md)
 * - IdempotencyService: Prevents duplicate operations using Bloom filters
 */
@Global()
@Module({
  providers: [DatabaseService, IdempotencyService],
  exports: [DatabaseService, IdempotencyService],
})
export class CommonModule {}
