import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { Transfer } from './entities/transfer.entity';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../balance/entities/transaction.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Transfer, User, Transaction]),
    CommonModule,
  ],
  controllers: [TransferController],
  providers: [TransferService],
})
export class TransferModule {}
