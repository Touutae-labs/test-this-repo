import { Test, TestingModule } from '@nestjs/testing';
import { BalanceService } from './balance.service';
import { UserRepository } from '../repositories/user.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { DatabaseService } from '../common/database.service';
import { MockDatabaseService } from '../common/test-helpers/mock-database.service';

describe('BalanceService', () => {
  let service: BalanceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        UserRepository,
        TransactionRepository,
        {
          provide: DatabaseService,
          useClass: MockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
