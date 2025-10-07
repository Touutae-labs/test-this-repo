import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../common/database.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { Transfer } from './entities/transfer.entity';
import {
  Transaction,
  TransactionType,
} from '../balance/entities/transaction.entity';
import { randomUUID } from 'crypto';

/**
 * Transfer Service
 * Handles money transfers between users
 *
 * CRITICAL PARTS TO IMPLEMENT:
 * 1. validateTransfer() - Implement comprehensive transfer validation
 * 2. Add transaction atomicity (use database transactions)
 * 3. Add transfer limits and rate limiting
 * 4. Add transfer fees calculation
 * 5. Add fraud detection mechanisms
 */
@Injectable()
export class TransferService {
  constructor(private readonly databaseService: DatabaseService) {}

  /**
   * Create a transfer between users
   *
   * CRITICAL: Implement proper transaction handling with atomicity
   */
  createTransfer(
    fromUserId: string,
    createTransferDto: CreateTransferDto,
  ): Transfer {
    const fromUser = this.databaseService.findUserById(fromUserId);

    if (!fromUser) {
      throw new NotFoundException('Sender not found');
    }

    const toUser = this.databaseService.findUserByUsername(
      createTransferDto.recipientUsername,
    );

    if (!toUser) {
      throw new NotFoundException('Recipient not found');
    }

    if (fromUser.id === toUser.id) {
      throw new BadRequestException('Cannot transfer to yourself');
    }

    // CRITICAL: Implement comprehensive validation
    this.validateTransfer(fromUser.balance, createTransferDto.amount);

    // CRITICAL: In a real database, this should be an atomic transaction
    // If any step fails, all changes should be rolled back

    // Deduct from sender
    const senderBalanceBefore = fromUser.balance;
    fromUser.balance -= createTransferDto.amount;
    fromUser.updatedAt = new Date();
    this.databaseService.saveUser(fromUser);

    // Add to recipient
    const recipientBalanceBefore = toUser.balance;
    toUser.balance += createTransferDto.amount;
    toUser.updatedAt = new Date();
    this.databaseService.saveUser(toUser);

    // Create transfer record
    const transfer = new Transfer({
      id: randomUUID(),
      fromUserId: fromUser.id,
      toUserId: toUser.id,
      amount: createTransferDto.amount,
      createdAt: new Date(),
    });
    this.databaseService.saveTransfer(transfer);

    // Record transactions for both users
    const senderTransaction = new Transaction({
      id: randomUUID(),
      userId: fromUser.id,
      amount: -createTransferDto.amount,
      type: TransactionType.TRANSFER_OUT,
      balanceBefore: senderBalanceBefore,
      balanceAfter: fromUser.balance,
      description: `Transfer to ${toUser.username}`,
      metadata: { transferId: transfer.id, recipientId: toUser.id },
      createdAt: new Date(),
    });
    this.databaseService.saveTransaction(senderTransaction);

    const recipientTransaction = new Transaction({
      id: randomUUID(),
      userId: toUser.id,
      amount: createTransferDto.amount,
      type: TransactionType.TRANSFER_IN,
      balanceBefore: recipientBalanceBefore,
      balanceAfter: toUser.balance,
      description: `Transfer from ${fromUser.username}`,
      metadata: { transferId: transfer.id, senderId: fromUser.id },
      createdAt: new Date(),
    });
    this.databaseService.saveTransaction(recipientTransaction);

    return transfer;
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
  getTransferHistory(userId: string): Transfer[] {
    const user = this.databaseService.findUserById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.databaseService.findTransfersByUserId(userId);
  }
}
