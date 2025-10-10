import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../common/decorators/user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import { CreateTopupDto } from './dto/create-topup.dto';
import { TopupService } from './topup.service';

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
  handleWebhook(
    @Body() payload: any,
    @Headers('X-Signature') signature?: string,
  ) {
    this.topupService.handleWebhook(payload, signature);
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
