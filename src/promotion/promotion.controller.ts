import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { PromotionService } from './promotion.service';
import { EvaluatePromotionDto } from './dto/evaluate-promotion.dto';
import { TestPromotionDto } from './dto/test-promotion.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

@Controller('promotion')
@UseGuards(AuthGuard)
export class PromotionController {
  constructor(private readonly promotionService: PromotionService) {}

  /**
   * Evaluate and apply promotions for a transaction
   * This endpoint demonstrates: Condition -> Action -> Side Effect
   */
  @Post('evaluate')
  async evaluatePromotion(
    @CurrentUser() userId: number,
    @Body() dto: EvaluatePromotionDto,
  ) {
    const result = await this.promotionService.evaluatePromotion({
      userId,
      amount: dto.amount,
      userTier: dto.userTier || 'BASIC',
      transactionType: dto.transactionType || 'TRANSFER',
    });

    return {
      success: true,
      message: `${result.promotionsApplied} promotion(s) applied`,
      data: result,
    };
  }

  /**
   * Test if promotions would apply without executing them
   * Useful for "preview" functionality
   */
  @Post('test')
  async testPromotion(
    @CurrentUser() userId: number,
    @Body() dto: TestPromotionDto,
  ) {
    const result = await this.promotionService.testPromotion({
      userId,
      amount: dto.amount,
      userTier: dto.userTier || 'BASIC',
      transactionType: dto.transactionType || 'TRANSFER',
    });

    return {
      success: true,
      message: result.wouldApply
        ? 'Promotions available'
        : 'No promotions available',
      data: result,
    };
  }

  /**
   * Get promotion history for the current user
   */
  @Get('history')
  async getHistory(@CurrentUser() userId: number) {
    const history = await this.promotionService.getPromotionHistory(userId);

    return {
      success: true,
      data: {
        total: history.length,
        promotions: history,
      },
    };
  }
}
