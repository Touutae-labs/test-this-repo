import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Topup } from './entities/topup.entity';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([Topup])],
  controllers: [TopupController],
  providers: [TopupService],
})
export class TopupModule {}
