import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../repositories/user.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { Transaction } from './entities/transaction.entity';

/**
 * Balance Service
 * Handles balance viewing and transaction history
 */
@Injectable()
export class BalanceService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly transactionRepository: TransactionRepository,
  ) {}

  /**
   * Get user's current balance
   */
  async getBalance(
    userId: string,
  ): Promise<{ balance: number; userId: string }> {
    const user = await this.userRepository.findById(userId);

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
  async getTransactionHistory(userId: string): Promise<Transaction[]> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transactionRepository.findByUserId(userId);
  }
}
