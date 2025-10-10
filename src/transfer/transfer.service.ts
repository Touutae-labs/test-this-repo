import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transfer } from './entities/transfer.entity';
import {
  Transaction,
  TransactionType,
} from '../balance/entities/transaction.entity';
import { User } from '../users/entities/user.entity';

/**
 * Transfer Service
 * Handles money transfers between users
 *
 * CRITICAL PARTS TO IMPLEMENT:
 * 1. validateTransfer() - Implement comprehensive transfer validation
 * 2. Add transaction atomicity (use database transactions - see DATABASE_SETUP.md)
 * 3. Add transfer limits and rate limiting
 * 4. Add transfer fees calculation
 * 5. Add fraud detection mechanisms
 *
 * ✅ IMPLEMENTED:
 * - Idempotency support structure (needs integration with IdempotencyService)
 */
@Injectable()
export class TransferService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Transfer)
    private readonly transferRepository: Repository<Transfer>,
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Create a transfer between users
   *
   * CRITICAL: Implement proper transaction handling with atomicity
   *
   * Example with idempotency:
   *
   * async createTransfer(
   *   fromUserId: string,
   *   createTransferDto: CreateTransferDto,
   * ): Promise<Transfer> {
   *   // Generate idempotency key to prevent duplicate transfers
   *   const idempotencyKey = this.idempotencyService.generateTransferKey(
   *     fromUserId,
   *     toUser.id,
   *     createTransferDto.amount,
   *     Date.now()
   *   );
   *
   *   // Check if transfer already processed
   *   if (await this.idempotencyService.isProcessed(idempotencyKey)) {
   *     const result = await this.idempotencyService.getProcessedResult(idempotencyKey);
   *     return result; // Return cached result
   *   }
   *
   *   // Use database transaction for atomicity
   *   const transfer = await this.dataSource.transaction(async (manager) => {
   *     // Lock users to prevent race conditions
   *     const fromUser = await manager.findOne(User, {
   *       where: { id: fromUserId },
   *       lock: { mode: 'pessimistic_write' },
   *     });
   *
   *     // ... perform transfer ...
   *
   *     return transfer;
   *   });
   *
   *   // Mark as processed
   *   await this.idempotencyService.markAsProcessed(idempotencyKey, transfer);
   *   return transfer;
   * }
   */
  async createTransfer(
    fromUserId: string,
    createTransferDto: CreateTransferDto,
  ): Promise<Transfer> {
    // Use database transaction for atomicity
    return await this.dataSource.transaction(async (manager) => {
      const fromUser = await manager.findOne(User, {
        where: { id: fromUserId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromUser) {
        throw new NotFoundException('Sender not found');
      }

      const toUser = await manager.findOne(User, {
        where: { username: createTransferDto.recipientUsername },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toUser) {
        throw new NotFoundException('Recipient not found');
      }

      if (fromUser.id === toUser.id) {
        throw new BadRequestException('Cannot transfer to yourself');
      }

      // CRITICAL: Implement comprehensive validation
      this.validateTransfer(fromUser.balance, createTransferDto.amount);

      // Deduct from sender
      const senderBalanceBefore = fromUser.balance;
      fromUser.balance -= createTransferDto.amount;
      await manager.save(fromUser);

      // Add to recipient
      const recipientBalanceBefore = toUser.balance;
      toUser.balance += createTransferDto.amount;
      await manager.save(toUser);

      // Create transfer record
      const transfer = manager.create(Transfer, {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: createTransferDto.amount,
      });
      await manager.save(transfer);

      // Record transactions for both users
      const senderTransaction = manager.create(Transaction, {
        userId: fromUser.id,
        amount: -createTransferDto.amount,
        type: TransactionType.TRANSFER_OUT,
        balanceBefore: senderBalanceBefore,
        balanceAfter: fromUser.balance,
        description: `Transfer to ${toUser.username}`,
        metadata: { transferId: transfer.id, recipientId: toUser.id },
      });
      await manager.save(senderTransaction);

      const recipientTransaction = manager.create(Transaction, {
        userId: toUser.id,
        amount: createTransferDto.amount,
        type: TransactionType.TRANSFER_IN,
        balanceBefore: recipientBalanceBefore,
        balanceAfter: toUser.balance,
        description: `Transfer from ${fromUser.username}`,
        metadata: { transferId: transfer.id, senderId: fromUser.id },
      });
      await manager.save(recipientTransaction);

      return transfer;
    });
  }

  /**
   * Validate transfer request
   *
   * CRITICAL: IMPLEMENT COMPREHENSIVE VALIDATION
   *
   * Add validations for:
   * 1. Sufficient balance
   * 2. Transfer limits (daily/monthly)
   * 3. Minimum transfer amount
   * 4. Fraud detection
   */
  private validateTransfer(senderBalance: number, amount: number): void {
    // CRITICAL: Implement comprehensive validation

    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be positive');
    }

    if (senderBalance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // TODO: Add minimum transfer amount check
    // if (amount < MIN_TRANSFER_AMOUNT) {
    //   throw new BadRequestException(`Minimum transfer amount is ${MIN_TRANSFER_AMOUNT}`);
    // }

    // TODO: Add maximum transfer amount check
    // if (amount > MAX_TRANSFER_AMOUNT) {
    //   throw new BadRequestException(`Maximum transfer amount is ${MAX_TRANSFER_AMOUNT}`);
    // }

    // TODO: Add daily/monthly limit check
    // TODO: Add fraud detection logic

    console.log('[CRITICAL] Implement comprehensive transfer validation');
  }

  /**
   * Get user's transfer history
   */
  async getTransferHistory(userId: string): Promise<Transfer[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.transferRepository.find({
      where: [{ fromUserId: userId }, { toUserId: userId }],
      order: { createdAt: 'DESC' },
    });
  }
}
