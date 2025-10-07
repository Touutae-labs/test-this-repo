import { Controller, Get, UseGuards } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

/**
 * Balance Controller
 * Handles balance viewing and transaction history endpoints
 */
@Controller('balance')
@UseGuards(AuthGuard)
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  /**
   * Get current user's balance
   * GET /balance
   */
  @Get()
  async getBalance(@CurrentUser() userId: string) {
    return this.balanceService.getBalance(userId);
  }

  /**
   * Get transaction history
   * GET /balance/history
   * OPTIONAL: This is a recommended feature
   */
  @Get('history')
  async getHistory(@CurrentUser() userId: string) {
    return this.balanceService.getTransactionHistory(userId);
  }
}
