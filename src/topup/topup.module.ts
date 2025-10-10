import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topup } from './entities/topup.entity';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { IdempotencyService } from '../common/idempotency.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Topup])],
  controllers: [TopupController],
  providers: [TopupService, IdempotencyService],
  exports: [TopupService, IdempotencyService],
})
export class TopupModule {}
