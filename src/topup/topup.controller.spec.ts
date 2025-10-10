import { Test, TestingModule } from '@nestjs/testing';
import { TopupController } from './topup.controller';
import { TopupService } from './topup.service';
import { UserRepository } from '../repositories/user.repository';
import { TopupRepository } from '../repositories/topup.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { DatabaseService } from '../common/database.service';
import { MockDatabaseService } from '../common/test-helpers/mock-database.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('TopupController', () => {
  let controller: TopupController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TopupController],
      providers: [
        TopupService,
        UserRepository,
        TopupRepository,
        TransactionRepository,
        ApiKeyRepository,
        {
          provide: DatabaseService,
          useClass: MockDatabaseService,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TopupController>(TopupController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
