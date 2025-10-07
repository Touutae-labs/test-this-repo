import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { TransferService } from './transfer.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/user.decorator';

/**
 * Transfer Controller
 * Handles money transfer endpoints
 */
@Controller('transfer')
@UseGuards(AuthGuard)
export class TransferController {
  constructor(private readonly transferService: TransferService) {}

  /**
   * Create a transfer
   * POST /transfer
   * Requires authentication
   */
  @Post()
  createTransfer(
    @CurrentUser() userId: string,
    @Body() createTransferDto: CreateTransferDto,
  ) {
    return this.transferService.createTransfer(userId, createTransferDto);
  }

  /**
   * Get transfer history
   * GET /transfer/history
   * Requires authentication
   */
  @Get('history')
  getHistory(@CurrentUser() userId: string) {
    return this.transferService.getTransferHistory(userId);
  }
}
