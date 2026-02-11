import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';
import { DataSource, Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
} from '../balance/entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { CreateTopupDto } from './dto/create-topup.dto';
import {
  ExternalTopupRequestDto,
  Topup,
  TopupStatus,
} from './entities/topup.entity';

/**
 * Top-up Service
 * Handles top-up functionality with external service integration
 */
@Injectable()
export class TopupService {
  private readonly logger = new Logger(TopupService.name);
  private readonly processedWebhooks = new Set<string>();

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Initiate a top-up request
   *
   * CRITICAL: Implement proper integration with external service
   */
  async createTopup(
    userId: string,
    createTopupDto: CreateTopupDto,
  ): Promise<Topup> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const topup = this.topupRepository.create({
      userId,
      amount: createTopupDto.amount,
      status: TopupStatus.PENDING,
    });

    await this.topupRepository.save(topup);

    // Process the top-up with external payment service
    try {
      await this.processExternalTopup(topup);
    } catch (error) {
      // Update status to failed if external service call fails
      topup.status = TopupStatus.FAILED;
      await this.topupRepository.save(topup);
      this.logger.error(
        `Failed to process topup ${topup.id}: ${error.message}`,
      );
      throw error;
    }

    return topup;
  }

  /**
   * Process top-up with external payment service
   */
  private async processExternalTopup(topup: Topup): Promise<void> {
    const externalServiceUrl = this.configService.get<string>(
      'EXTERNAL_SERVICE_URL',
      'http://localhost:3000',
    );
    const apiKey = this.configService.get<string>('EXTERNAL_API_KEY');

    if (!apiKey) {
      throw new BadRequestException('EXTERNAL_API_KEY is not configured');
    }

    try {
      const payload: ExternalTopupRequestDto = {
        referenceId: topup.id,
        walletId: topup.userId,
        amount: topup.amount,
        currency: 'THB',
      };

      // Make API call to external service
      const response = await firstValueFrom(
        this.httpService.post(`${externalServiceUrl}/payments/topup`, payload, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      console.log('response', response.data);

      // Update topup with external transaction ID
      if (response.data.requestId) {
        topup.externalTransactionId = response.data.requestId;
        await this.topupRepository.save(topup);
        this.logger.log(
          `Topup ${topup.id} sent to external service with requestId: ${response.data.requestId}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to call external service for topup ${topup.id}: ${error.message}`,
      );
      throw new BadRequestException(
        'Failed to process topup with external service',
      );
    }
  }

  /**
   * Handle webhook notification from external service
   */
  async handleWebhook(payload: any, signature?: string): Promise<void> {
    // 1. Verify signature
    const isValid = this.verifyWebhookSignature(payload, signature);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature received');
      throw new BadRequestException('Invalid webhook signature');
    }

    // 2. Check idempotency - prevent duplicate processing
    const webhookData = payload;
    const idempotencyKey = `webhook_${webhookData.requestId}_${webhookData.referenceId}`;

    if (this.processedWebhooks.has(idempotencyKey)) {
      this.logger.log(`Webhook already processed: ${idempotencyKey}`);
      return;
    }

    // 3. Extract transaction details from webhook payload
    const topupId = webhookData.referenceId; // This is our topup.id
    const externalTransactionId = webhookData.requestId; // This is external service's ID

    this.logger.log(
      `Processing webhook for topup ${topupId}, status: ${webhookData.status}, event: ${webhookData.event}`,
    );

    // 4. Update topup status based on webhook data
    if (
      webhookData.status.toLowerCase() === TopupStatus.COMPLETED.toLowerCase()
    ) {
      await this.completeTopup(topupId, externalTransactionId);
    } else if (
      webhookData.status.toLowerCase() === TopupStatus.FAILED.toLowerCase()
    ) {
      const topup = await this.topupRepository.findOne({
        where: { id: topupId },
      });
      if (topup) {
        topup.status = TopupStatus.FAILED;
        await this.topupRepository.save(topup);
        this.logger.log(
          `Topup ${topupId} marked as failed: ${webhookData.statusMessage}`,
        );
      }
    }

    // 5. Mark as processed to ensure idempotency
    this.processedWebhooks.add(idempotencyKey);
  }

  /**
   * Verify webhook signature
   *
   * CRITICAL: IMPLEMENT THIS METHOD
   * Use WEBHOOK_SECRET from environment to verify signature
   */
  private verifyWebhookSignature(payload: any, signature?: string): boolean {
    if (!signature) {
      this.logger.warn('No webhook signature provided');
      return false;
    }

    const webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');
    if (!webhookSecret) {
      this.logger.warn('WEBHOOK_SECRET is not configured');
      return false;
    }

    try {
      // Create HMAC-SHA256 hash of the payload
      const payloadString = JSON.stringify(payload);
      const hmac = crypto.createHmac('sha256', webhookSecret);
      hmac.update(payloadString);
      const expectedSignature = hmac.digest('hex');

      // Compare signatures
      const isValid = signature === expectedSignature;
      if (!isValid) {
        this.logger.warn(
          `Signature mismatch. Expected: ${expectedSignature}, Received: ${signature}`,
        );
      }
      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying webhook signature: ${error.message}`);
      return false;
    }
  }

  /**
   * Complete a top-up (called after webhook confirmation)
   *
   * CRITICAL: Implement proper transaction handling with atomicity
   */
  async completeTopup(
    topupId: string,
    externalTransactionId: string,
  ): Promise<void> {
    // Use database transaction for atomicity
    await this.dataSource.transaction(async (manager) => {
      const topup = await manager.findOne(Topup, {
        where: { id: topupId },
        // SQLlite Doesn't Support this
        // lock: { mode: 'pessimistic_write' },
      });

      if (!topup) {
        throw new NotFoundException('Top-up not found');
      }

      if (topup.status !== TopupStatus.PENDING) {
        this.logger.warn(
          `Topup ${topupId} is not in pending status: ${topup.status}`,
        );
        return;
      }

      const user = await manager.findOne(User, {
        where: { id: topup.userId },
        // SQLlite Doesn't Support this
        // lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Update user balance
      const balanceBefore = user.balance;
      user.balance += topup.amount;
      await manager.save(user);

      // Update topup status
      topup.status = TopupStatus.COMPLETED;
      topup.externalTransactionId = externalTransactionId;
      await manager.save(topup);

      // Record transaction
      const transaction = manager.create(Transaction, {
        userId: user.id,
        amount: topup.amount,
        type: TransactionType.TOPUP,
        balanceBefore,
        balanceAfter: user.balance,
        description: `Top-up: ${topup.amount}`,
        metadata: { topupId, externalTransactionId },
      });
      await manager.save(transaction);

      this.logger.log(
        `Topup ${topupId} completed successfully. User ${user.id} balance updated to ${user.balance}`,
      );
    });
  }

  /**
   * Get user's top-up history
   */
  async getTopupHistory(userId: string): Promise<Topup[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.topupRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }
}
