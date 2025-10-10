import { Test, TestingModule } from '@nestjs/testing';
import { TransferController } from './transfer.controller';
import { TransferService } from './transfer.service';
import { UserRepository } from '../repositories/user.repository';
import { TransferRepository } from '../repositories/transfer.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { DatabaseService } from '../common/database.service';
import { MockDatabaseService } from '../common/test-helpers/mock-database.service';

describe('TransferController', () => {
  let controller: TransferController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransferController],
      providers: [
        TransferService,
        UserRepository,
        TransferRepository,
        TransactionRepository,
        ApiKeyRepository,
        {
          provide: DatabaseService,
          useClass: MockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<TransferController>(TransferController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
