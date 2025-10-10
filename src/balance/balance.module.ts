import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User]), CommonModule],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
