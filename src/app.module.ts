import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceModule } from './balance/balance.module';
import { TopupModule } from './topup/topup.module';
import { TransferModule } from './transfer/transfer.module';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { Topup } from './topup/entities/topup.entity';
import { Transfer } from './transfer/entities/transfer.entity';
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'data/ewallet.db',
      entities: [User, Topup, Transfer],
      synchronize: true,
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    UsersModule,
    BalanceModule,
    TopupModule,
    TransferModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
