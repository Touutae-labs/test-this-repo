import { Controller, Post, Get, Body, UseGuards, Headers } from '@nestjs/common';
import { TopupService } from './topup.service';
import { CreateTopupDto } from './dto/create-topup.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

/**
 * Top-up Controller
 * Handles top-up requests and webhook notifications
 */
@Controller('topup')
export class TopupController {
  constructor(private readonly topupService: TopupService) {}

  /**
   * Create a new top-up request
   * POST /topup
   * Requires authentication
   */
  @Post()
  @UseGuards(AuthGuard)
  async createTopup(
    @CurrentUser() userId: string,
    @Body() createTopupDto: CreateTopupDto,
  ) {
    return this.topupService.createTopup(userId, createTopupDto);
  }

  /**
   * Webhook endpoint for external service notifications
   * POST /topup/webhook
   * 
   * CRITICAL: This endpoint should be accessible without authentication
   * but must verify webhook signature for security
   */
  @Post('webhook')
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-webhook-signature') signature?: string,
  ) {
    await this.topupService.handleWebhook(payload, signature);
    return { success: true };
  }

  /**
   * Get top-up history
   * GET /topup/history
   * Requires authentication
   */
  @Get('history')
  @UseGuards(AuthGuard)
  async getHistory(@CurrentUser() userId: string) {
    return this.topupService.getTopupHistory(userId);
  }
}
