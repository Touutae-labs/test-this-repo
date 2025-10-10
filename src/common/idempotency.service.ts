import { Injectable } from '@nestjs/common';

/**
 * Simple in-memory idempotency service
 * Prevents duplicate webhook processing
 */
@Injectable()
export class IdempotencyService {
  private processedKeys = new Set<string>();
  private keyTimestamps = new Map<string, number>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  /**
   * Generate idempotency key for webhook
   */
  generateWebhookKey(webhookId: string, eventType: string): string {
    return `webhook:${webhookId}:${eventType}`;
  }

  /**
   * Generate idempotency key for topup
   */
  generateTopupKey(userId: string, amount: number, timestamp: number): string {
    return `topup:${userId}:${amount}:${Math.floor(timestamp / 60000)}`; // Round to minute
  }

  /**
   * Check if key has been processed
   */
  async isProcessed(key: string): Promise<boolean> {
    this.cleanup(); // Remove expired keys
    return this.processedKeys.has(key);
  }

  /**
   * Mark key as processed
   */
  async markAsProcessed(key: string, _result?: any): Promise<void> {
    this.processedKeys.add(key);
    this.keyTimestamps.set(key, Date.now());
  }

  /**
   * Clean up expired keys
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.keyTimestamps.forEach((timestamp, key) => {
      if (now - timestamp > this.TTL) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.processedKeys.delete(key);
      this.keyTimestamps.delete(key);
    });
  }

  /**
   * Get processed result (placeholder for more complex implementations)
   */
  async getProcessedResult(_key: string): Promise<any> {
    // In a more complex implementation, you might store results
    return { message: 'Already processed' };
  }
}
