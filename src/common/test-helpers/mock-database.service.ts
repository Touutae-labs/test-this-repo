import { UserRepository } from '../../repositories/user.repository';
import { ApiKeyRepository } from '../../repositories/api-key.repository';
import { TransactionRepository } from '../../repositories/transaction.repository';
import { TopupRepository } from '../../repositories/topup.repository';
import { TransferRepository } from '../../repositories/transfer.repository';

/**
 * Mock Database Service for testing
 * Provides mock repository instances
 */
export class MockDatabaseService {
  userRepository: Partial<UserRepository>;
  apiKeyRepository: Partial<ApiKeyRepository>;
  transactionRepository: Partial<TransactionRepository>;
  topupRepository: Partial<TopupRepository>;
  transferRepository: Partial<TransferRepository>;

  constructor() {
    // Initialize with empty mock repositories
    this.userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUsername: jest.fn(),
    };

    this.apiKeyRepository = {
      save: jest.fn(),
      findUserIdByApiKey: jest.fn(),
      delete: jest.fn(),
      cleanupExpired: jest.fn(),
    };

    this.transactionRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
    };

    this.topupRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByIdempotencyKey: jest.fn(),
    };

    this.transferRepository = {
      save: jest.fn(),
      findByUserId: jest.fn(),
      findByIdempotencyKey: jest.fn(),
    };
  }
}
