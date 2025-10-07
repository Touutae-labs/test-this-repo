import { Module, Global } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Common Module
 * Provides shared services like DatabaseService globally
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class CommonModule {}
