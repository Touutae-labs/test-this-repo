import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { Transaction } from './entities/transaction.entity';

/**
 * Balance Service
 * Handles balance viewing and transaction history
 */
@Injectable()
export class BalanceService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Get user's current balance
   */
  getBalance(userId: string): { balance: number; userId: string } {
    const user = this.databaseService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      userId: user.id,
      balance: user.balance,
    };
  }

  /**
   * Get user's transaction history
   * OPTIONAL: This is a recommended feature
   */
  getTransactionHistory(userId: string): Transaction[] {
    const user = this.databaseService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.databaseService.findTransactionsByUserId(userId);
  }
}
