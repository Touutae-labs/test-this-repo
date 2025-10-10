import { Test, TestingModule } from '@nestjs/testing';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { UserRepository } from '../repositories/user.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { DatabaseService } from '../common/database.service';
import { MockDatabaseService } from '../common/test-helpers/mock-database.service';

describe('BalanceController', () => {
  let controller: BalanceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        BalanceService,
        UserRepository,
        TransactionRepository,
        ApiKeyRepository,
        {
          provide: DatabaseService,
          useClass: MockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
