import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';

/**
 * Balance Service
 * Handles balance viewing and transaction history
 */
@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  /**
   * Get user's current balance
   */
  async getBalance(
    userId: string,
  ): Promise<{ balance: number; userId: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

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
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
