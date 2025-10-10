import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UserRepository } from '../repositories/user.repository';
import { TopupRepository } from '../repositories/topup.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { CreateTopupDto } from './dto/create-topup.dto';
import { Topup, TopupStatus } from './entities/topup.entity';
import {
  Transaction,
  TransactionType,
} from '../balance/entities/transaction.entity';
import { randomUUID } from 'crypto';
// Uncomment when implementing external service integration:
// import { firstValueFrom } from 'rxjs';

/**
 * Top-up Service
 * Handles top-up functionality with external service integration
 *
 * CRITICAL PARTS TO IMPLEMENT:
 * 1. processExternalTopup() - Integrate with the external payment service
 * 2. handleWebhook() - Process webhook notifications from external service
 * 3. verifyWebhookSignature() - Implement webhook signature verification
 *
 * ✅ IMPLEMENTED:
 * 4. Idempotency handling using Bloom filters and IdempotencyService
 * 5. Proper error handling structure
 */
@Injectable()
export class TopupService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly topupRepository: TopupRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const topup = new Topup({
      id: randomUUID(),
      userId,
      amount: createTopupDto.amount,
      status: TopupStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await this.topupRepository.save(topup);

    // CRITICAL: Implement external service integration
    // Process the top-up with external payment service
    try {
      this.processExternalTopup(topup);
    } catch (error) {
      // Update status to failed if external service call fails
      topup.status = TopupStatus.FAILED;
      topup.updatedAt = new Date();
      await this.topupRepository.save(topup);
      throw error;
    }

    return topup;
  }

  /**
   * Process top-up with external payment service
   *
   * CRITICAL: IMPLEMENT THIS METHOD
   *
   * Steps to implement:
   * 1. Get external service URL and API key from environment
   * 2. Make HTTP request to external service API
   * 3. Handle response and update topup status
   * 4. See Swagger docs at http://localhost:3000/doc for API details
   */
  private processExternalTopup(topup: Topup): void {
    // CRITICAL: Implement external service call
    // Example implementation structure:

    const _externalServiceUrl = this.configService.get<string>(
      'EXTERNAL_SERVICE_URL',
      'http://localhost:3000',
    );
    const _apiKey = this.configService.get<string>('EXTERNAL_API_KEY');

    // TODO: Make API call to external service
    // const response = await firstValueFrom(
    //   this.httpService.post(`${externalServiceUrl}/api/topup`, {
    //     topupId: topup.id,
    //     amount: topup.amount,
    //   }, {
    //     headers: {
    //       'x-api-key': apiKey,
    //     },
    //   })
    // );

    // TODO: Handle response
    // topup.externalTransactionId = response.data.transactionId;
    // topup.updatedAt = new Date();
    // this.databaseService.saveTopup(topup);

    console.log(
      `[CRITICAL] Implement external service integration for topup ${topup.id}`,
    );
    // Note: Status will be updated when webhook is received
  }

  /**
   * Handle webhook notification from external service
   *
   * CRITICAL: IMPLEMENT THIS METHOD
   *
   * Steps to implement:
   * 1. Verify webhook signature using WEBHOOK_SECRET
   * 2. Check idempotency to prevent duplicate processing
   * 3. Extract transaction details from webhook payload
   * 4. Update topup status based on webhook data
   * 5. Update user balance if top-up is successful
   * 6. Record transaction in history
   * 7. Mark webhook as processed
   *
   * Example implementation with idempotency:
   *
   * async handleWebhook(payload: any, signature?: string): Promise<void> {
   *   // 1. Verify signature
   *   const isValid = this.verifyWebhookSignature(payload, signature);
   *   if (!isValid) {
   *     throw new BadRequestException('Invalid webhook signature');
   *   }
   *
   *   // 2. Check idempotency using IdempotencyService
   *   const idempotencyKey = this.idempotencyService.generateWebhookKey(
   *     payload.webhookId,
   *     payload.eventType
   *   );
   *
   *   if (await this.idempotencyService.isProcessed(idempotencyKey)) {
   *     console.log('Webhook already processed:', idempotencyKey);
   *     return; // Already processed, skip to prevent duplicate
   *   }
   *
   *   // 3. Process webhook
   *   const { topupId, status, externalTransactionId } = payload;
   *
   *   if (status === 'SUCCESS') {
   *     this.completeTopup(topupId, externalTransactionId);
   *   } else if (status === 'FAILED') {
   *     const topup = this.databaseService.findTopupById(topupId);
   *     if (topup) {
   *       topup.status = TopupStatus.FAILED;
   *       topup.updatedAt = new Date();
   *       this.databaseService.saveTopup(topup);
   *     }
   *   }
   *
   *   // 4. Mark as processed to ensure idempotency
   *   await this.idempotencyService.markAsProcessed(idempotencyKey, { topupId, status });
   * }
   */
  handleWebhook(payload: any, signature?: string): void {
    // CRITICAL: Implement webhook signature verification
    // const isValid = this.verifyWebhookSignature(payload, signature);
    // if (!isValid) {
    //   throw new BadRequestException('Invalid webhook signature');
    // }

    // CRITICAL: Implement webhook processing logic with idempotency
    // See example implementation in comments above
    console.log('[CRITICAL] Implement webhook handling logic with idempotency');
    console.log('Webhook payload:', payload);
    console.log('Webhook signature:', signature);

    // TODO: Check idempotency using IdempotencyService before processing
    // TODO: Extract topup ID from payload
    // TODO: Find topup in database
    // TODO: Update topup status
    // TODO: If successful, update user balance
    // TODO: Record transaction
    // TODO: Mark webhook as processed for idempotency
  }

  /**
   * Verify webhook signature
   *
   * CRITICAL: IMPLEMENT THIS METHOD
   * Use WEBHOOK_SECRET from environment to verify signature
   */
  private verifyWebhookSignature(_payload: any, _signature: string): boolean {
    // CRITICAL: Implement signature verification
    const _webhookSecret = this.configService.get<string>('WEBHOOK_SECRET');

    // TODO: Implement HMAC signature verification
    // Example: compare HMAC-SHA256 of payload with signature

    console.log('[CRITICAL] Implement webhook signature verification');
    return true; // Placeholder
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
    const topup = await this.topupRepository.findById(topupId);

    if (!topup) {
      throw new NotFoundException('Top-up not found');
    }

    if (topup.status !== TopupStatus.PENDING) {
      throw new BadRequestException('Top-up is not in pending status');
    }

    const user = await this.userRepository.findById(topup.userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // CRITICAL: Implement atomic transaction
    // In a real database, this should be done in a transaction
    const balanceBefore = user.balance;
    user.balance += topup.amount;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    // Update topup status
    topup.status = TopupStatus.SUCCESS;
    topup.externalTransactionId = externalTransactionId;
    topup.updatedAt = new Date();
    await this.topupRepository.save(topup);

    // Record transaction
    const transaction = new Transaction({
      id: randomUUID(),
      userId: user.id,
      amount: topup.amount,
      type: TransactionType.TOPUP,
      balanceBefore,
      balanceAfter: user.balance,
      description: `Top-up: ${topup.amount}`,
      metadata: { topupId, externalTransactionId },
      createdAt: new Date(),
    });
    await this.transactionRepository.save(transaction);
  }

  /**
   * Get user's top-up history
   */
  async getTopupHistory(userId: string): Promise<Topup[]> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.topupRepository.findByUserId(userId);
  }
}
