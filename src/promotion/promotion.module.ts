import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PromotionController } from './promotion.controller';
import { PromotionService } from './promotion.service';
import { PromotionLog } from './entities/promotion-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PromotionLog])],
  controllers: [PromotionController],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
