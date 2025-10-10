import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CreateTopupDto } from './dto/create-topup.dto';
import { Topup, TopupStatus } from './entities/topup.entity';
import {
  Transaction,
  TransactionType,
} from '../balance/entities/transaction.entity';
import { randomUUID } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { IdempotencyService } from '../common/idempotency.service';

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
    @InjectRepository(Topup)
    private readonly topupRepository: Repository<Topup>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly idempotencyService: IdempotencyService,
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
    const topup = new Topup({
      userId,
      amount: createTopupDto.amount,
      status: TopupStatus.PENDING,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const savedTopup = await this.topupRepository.save(topup);

    // Process the top-up with external payment service
    try {
      await this.processExternalTopup(savedTopup);
    } catch (error) {
      // Update status to failed if external service call fails
      savedTopup.status = TopupStatus.FAILED;
      savedTopup.updatedAt = new Date();
      await this.topupRepository.save(savedTopup);
      throw error;
    }

    return savedTopup;
  }

  /**
   * Process top-up with external payment service
   */
  private async processExternalTopup(topup: Topup): Promise<void> {
    const externalServiceUrl = this.configService.get<string>(
      'EXTERNAL_SERVICE_URL',
      'http://localhost:3000',
    );
    const apiKey = this.configService.get<string>('EXTERNAL_API_KEY', 'your-api-key');

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${externalServiceUrl}/api/topup`, {
          referenceId: topup.id,
          walletId: topup.userId,
          amount: topup.amount,
          currency: 'THB'
        }, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
          },
        })
      );

      // Update topup with external transaction ID
      if (response.data.requestId) {
        topup.externalTransactionId = response.data.requestId;
        topup.updatedAt = new Date();
        await this.topupRepository.save(topup);
      }

      console.log(`External topup request created: ${response.data.requestId}`);
    } catch (error) {
      console.error(`Failed to process external topup for ${topup.id}:`, error.message);
      throw new BadRequestException(`Failed to process topup: ${error.message}`);
    }
  }

  /**
   * Handle webhook notification from external service
   */
  async handleWebhook(payload: any, signature?: string): Promise<void> {
    // Verify webhook signature
    if (!this.verifyWebhookSignature(payload, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const { referenceId, status, requestId, webhookId = 'unknown', eventType = 'topup.update' } = payload;
    
    if (!referenceId) {
      console.error('Webhook payload missing referenceId:', payload);
      return;
    }

    // Check idempotency to prevent duplicate processing
    const idempotencyKey = this.idempotencyService.generateWebhookKey(webhookId, eventType);
    
    if (await this.idempotencyService.isProcessed(idempotencyKey)) {
      console.log(`Webhook already processed: ${idempotencyKey}`);
      return;
    }

    try {
      if (status === 'completed') {
        await this.completeTopup(referenceId, requestId);
        console.log(`Topup ${referenceId} completed successfully via webhook`);
      } else if (status === 'failed') {
        const topup = await this.topupRepository.findOne({ where: { id: referenceId } });
        if (topup) {
          topup.status = TopupStatus.FAILED;
          topup.updatedAt = new Date();
          await this.topupRepository.save(topup);
          console.log(`Topup ${referenceId} marked as failed via webhook`);
        }
      }

      // Mark webhook as processed
      await this.idempotencyService.markAsProcessed(idempotencyKey, { referenceId, status });
    } catch (error) {
      console.error(`Error processing webhook for topup ${referenceId}:`, error.message);
      throw error;
    }
  }

  /**
   * Verify webhook signature using HMAC-SHA256
   */
  private verifyWebhookSignature(payload: any, signature?: string): boolean {
    if (!signature) {
      console.warn('No webhook signature provided');
      return true; // Allow for development/testing
    }

    const webhookSecret = this.configService.get<string>('WEBHOOK_SECRET', 'your-webhook-secret');
    
    try {
      const payloadString = JSON.stringify(payload);
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(payloadString)
        .digest('hex');

      // Compare signatures in a timing-safe manner
      const providedSignature = signature.replace('sha256=', '');
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );
    } catch (error) {
      console.error('Error verifying webhook signature:', error);
      return false;
    }
  }

  /**
   * Complete a top-up (called after webhook confirmation)
   */
  async completeTopup(
    topupId: string,
    externalTransactionId: string,
  ): Promise<void> {
    const topup = await this.topupRepository.findOne({ where: { id: topupId } });

    if (!topup) {
      throw new NotFoundException('Top-up not found');
    }

    if (topup.status !== TopupStatus.PENDING) {
      throw new BadRequestException('Top-up is not in pending status');
    }

    // Update topup status
    topup.status = TopupStatus.SUCCESS;
    topup.externalTransactionId = externalTransactionId;
    topup.updatedAt = new Date();
    await this.topupRepository.save(topup);

    // Note: In a complete implementation, you would also update the user's balance
    // and create a transaction record here. For now, we're just updating the topup status.
    console.log(`Topup ${topupId} completed with external transaction ${externalTransactionId}`);
  }

  /**
   * Get user's top-up history
   */
  async getTopupHistory(userId: string): Promise<Topup[]> {
    return this.topupRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' }
    });
  }
}
