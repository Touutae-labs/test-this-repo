import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';

@Module({
  imports: [HttpModule],
  controllers: [TopupController],
  providers: [TopupService],
})
export class TopupModule {}
