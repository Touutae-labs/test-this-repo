import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRepository } from '../repositories/user.repository';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { DatabaseService } from '../common/database.service';
import { MockDatabaseService } from '../common/test-helpers/mock-database.service';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        UserRepository,
        ApiKeyRepository,
        {
          provide: DatabaseService,
          useClass: MockDatabaseService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
