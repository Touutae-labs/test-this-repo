import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topup } from './entities/topup.entity';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../balance/entities/transaction.entity';
import { CommonModule } from '../common/common.module';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Topup, User, Transaction]),
    CommonModule,
  ],
  controllers: [TopupController],
  providers: [TopupService],
})
export class TopupModule {}
