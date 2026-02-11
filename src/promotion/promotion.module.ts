import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PromotionLog } from './entities/promotion-log.entity';
import { User } from '../users/entities/user.entity';
import { ApiKey } from '../common/entities/api-key.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionLog, User, ApiKey])],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
