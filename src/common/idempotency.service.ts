import { Injectable } from '@nestjs/common';
import { BloomFilter } from 'bloom-filters';

/**
 * Idempotency Service
 *
 * Prevents duplicate operations using a combination of:
 * 1. Bloom Filter for fast probabilistic checks
 * 2. In-memory/database storage for definitive verification
 *
 * This is critical for:
 * - Preventing duplicate top-ups
 * - Preventing duplicate transfers
 * - Ensuring webhook idempotency
 */
@Injectable()
export class IdempotencyService {
  // Bloom filter for fast duplicate detection
  // False positive rate: 0.01 (1%)
  private bloomFilter: BloomFilter;

  // Definitive storage for idempotency keys
  // In production, this should be in Redis or database
  private processedKeys: Map<string, { timestamp: Date; result: any }> =
    new Map();

  // TTL for idempotency keys (24 hours)
  private readonly TTL_MS = 24 * 60 * 60 * 1000;

  constructor() {
    // Initialize bloom filter
    // Estimated 10,000 operations per day, 0.01 false positive rate
    this.bloomFilter = BloomFilter.create(10000, 0.01);
  }

  /**
   * Check if an operation has been processed
   *
   * @param idempotencyKey - Unique key for the operation (e.g., webhook ID, transaction ID)
   * @returns true if already processed, false otherwise
   */
  async isProcessed(idempotencyKey: string): Promise<boolean> {
    // Fast check using bloom filter
    if (!this.bloomFilter.has(idempotencyKey)) {
      // Definitely not processed
      return false;
    }

    // Bloom filter says "maybe processed" - check definitive storage
    const record = this.processedKeys.get(idempotencyKey);

    if (!record) {
      // False positive from bloom filter
      return false;
    }

    // Check if the key has expired
    const now = new Date();
    if (now.getTime() - record.timestamp.getTime() > this.TTL_MS) {
      // Key expired, remove it
      this.processedKeys.delete(idempotencyKey);
      return false;
    }

    return true;
  }

  /**
   * Mark an operation as processed
   *
   * @param idempotencyKey - Unique key for the operation
   * @param result - Result of the operation (optional)
   */
  async markAsProcessed(idempotencyKey: string, result?: any): Promise<void> {
    // Add to bloom filter
    this.bloomFilter.add(idempotencyKey);

    // Add to definitive storage
    this.processedKeys.set(idempotencyKey, {
      timestamp: new Date(),
      result,
    });
  }

  /**
   * Get the result of a previously processed operation
   *
   * @param idempotencyKey - Unique key for the operation
   * @returns the result if found, undefined otherwise
   */
  async getProcessedResult(idempotencyKey: string): Promise<any> {
    const record = this.processedKeys.get(idempotencyKey);

    if (!record) {
      return undefined;
    }

    // Check if the key has expired
    const now = new Date();
    if (now.getTime() - record.timestamp.getTime() > this.TTL_MS) {
      this.processedKeys.delete(idempotencyKey);
      return undefined;
    }

    return record.result;
  }

  /**
   * Clean up expired keys (should be called periodically)
   */
  async cleanup(): Promise<void> {
    const now = new Date();
    const keysToDelete: string[] = [];

    for (const [key, record] of this.processedKeys.entries()) {
      if (now.getTime() - record.timestamp.getTime() > this.TTL_MS) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.processedKeys.delete(key);
    }

    console.log(
      `[IdempotencyService] Cleaned up ${keysToDelete.length} expired keys`,
    );
  }

  /**
   * Generate idempotency key for webhook
   */
  generateWebhookKey(webhookId: string, eventType: string): string {
    return `webhook:${eventType}:${webhookId}`;
  }

  /**
   * Generate idempotency key for transfer
   */
  generateTransferKey(
    fromUserId: string,
    toUserId: string,
    amount: number,
    timestamp: number,
  ): string {
    return `transfer:${fromUserId}:${toUserId}:${amount}:${timestamp}`;
  }

  /**
   * Generate idempotency key for top-up
   */
  generateTopupKey(userId: string, amount: number, timestamp: number): string {
    return `topup:${userId}:${amount}:${timestamp}`;
  }
}
