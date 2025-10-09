# Database Setup Guide

This guide provides a complete implementation example using TypeORM with PostgreSQL. The same principles can be applied to MySQL, MongoDB, or other databases.

## Option 1: TypeORM with PostgreSQL (Recommended)

### Step 1: Install Dependencies

```bash
npm install @nestjs/typeorm typeorm pg
```

### Step 2: Create TypeORM Entities

Replace the simple class entities with TypeORM entities:

#### `src/users/entities/user.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Transaction } from '../../balance/entities/transaction.entity';
import { Topup } from '../../topup/entities/topup.entity';
import { Transfer } from '../../transfer/entities/transfer.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Transaction, transaction => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Topup, topup => topup.user)
  topups: Topup[];

  @OneToMany(() => Transfer, transfer => transfer.fromUser)
  sentTransfers: Transfer[];

  @OneToMany(() => Transfer, transfer => transfer.toUser)
  receivedTransfers: Transfer[];
}
```

#### `src/balance/entities/transaction.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TransactionType {
  TOPUP = 'TOPUP',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

@Entity('transactions')
@Index(['userId', 'createdAt'])
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, user => user.transactions)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceBefore: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### `src/topup/entities/topup.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum TopupStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Entity('topups')
@Index(['userId', 'status'])
export class Topup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @ManyToOne(() => User, user => user.topups)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: TopupStatus,
    default: TopupStatus.PENDING,
  })
  status: TopupStatus;

  @Column({ nullable: true, unique: true })
  externalTransactionId?: string;

  @Column({ nullable: true, unique: true })
  idempotencyKey?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### `src/transfer/entities/transfer.entity.ts`

```typescript
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('transfers')
@Index(['fromUserId', 'createdAt'])
@Index(['toUserId', 'createdAt'])
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  fromUserId: string;

  @ManyToOne(() => User, user => user.sentTransfers)
  @JoinColumn({ name: 'fromUserId' })
  fromUser: User;

  @Column('uuid')
  toUserId: string;

  @ManyToOne(() => User, user => user.receivedTransfers)
  @JoinColumn({ name: 'toUserId' })
  toUser: User;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ nullable: true, unique: true })
  idempotencyKey?: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### `src/common/entities/idempotency.entity.ts` (New)

```typescript
import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity('idempotency_keys')
export class IdempotencyKey {
  @PrimaryColumn()
  key: string;

  @Column({ type: 'jsonb', nullable: true })
  result?: any;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;
}
```

### Step 3: Configure TypeORM in AppModule

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { BalanceModule } from './balance/balance.module';
import { TopupModule } from './topup/topup.module';
import { TransferModule } from './transfer/transfer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'ewallet'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') !== 'production', // Set to false in production
        logging: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    CommonModule,
    UsersModule,
    BalanceModule,
    TopupModule,
    TransferModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

### Step 4: Update Services to Use TypeORM

#### Update `src/users/users.service.ts`

```typescript
import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    // Store API keys in a separate table or Redis in production
    private readonly apiKeys: Map<string, string> = new Map(),
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: User; apiKey: string }> {
    const existingUser = await this.userRepository.findOne({
      where: { username: createUserDto.username },
    });
    
    if (existingUser) {
      throw new ConflictException('Username already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.userRepository.create({
      username: createUserDto.username,
      password: hashedPassword,
      balance: 0,
    });

    await this.userRepository.save(user);

    const apiKey = this.generateApiKey();
    this.apiKeys.set(apiKey, user.id);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, apiKey };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; apiKey: string }> {
    const user = await this.userRepository.findOne({
      where: { username: loginDto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const apiKey = this.generateApiKey();
    this.apiKeys.set(apiKey, user.id);

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, apiKey };
  }

  async findById(userId: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: userId } });
  }

  findUserIdByApiKey(apiKey: string): string | undefined {
    return this.apiKeys.get(apiKey);
  }

  private generateApiKey(): string {
    return `ewallet_${randomUUID().replace(/-/g, '')}`;
  }
}
```

### Step 5: Update Environment Variables

Add to `.env.example`:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=ewallet

# Node Environment
NODE_ENV=development
```

### Step 6: Docker Compose for PostgreSQL

Update `docker-compose.yml`:

```yaml
version: "3.8"

services:
  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: ewallet-postgres
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: ewallet
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  # External payment service
  backend-interview:
    image: apemon/backend-interview:latest
    container_name: backend-interview-app
    ports:
      - "3000:3000"
    environment:
      - WEBHOOK_URL=http://host.docker.internal:8080/topup/webhook
      - WEBHOOK_SECRET=your-webhook-secret
      - API_KEY=your-api-key
      - SUCCESS_TOPUP_STATUS_RATE=0.9
      - IGNORE_WEBHOOK_RATE=0.1
    restart: unless-stopped
    extra_hosts:
      - "host.docker.internal:host-gateway"

volumes:
  postgres_data:
```

### Step 7: Database Migrations (Production)

For production, use migrations instead of `synchronize: true`:

```bash
# Generate migration
npm run typeorm migration:generate -- -n InitialSchema

# Run migrations
npm run typeorm migration:run
```

Add to `package.json`:

```json
{
  "scripts": {
    "typeorm": "typeorm-ts-node-commonjs"
  }
}
```

## Option 2: Prisma (Alternative)

### Install Prisma

```bash
npm install @prisma/client
npm install -D prisma
```

### Initialize Prisma

```bash
npx prisma init
```

### Create Prisma Schema

Edit `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id              String        @id @default(uuid())
  username        String        @unique
  password        String
  balance         Decimal       @default(0) @db.Decimal(15, 2)
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  transactions    Transaction[]
  topups          Topup[]
  sentTransfers   Transfer[]    @relation("SentTransfers")
  receivedTransfers Transfer[]  @relation("ReceivedTransfers")

  @@map("users")
}

model Transaction {
  id            String          @id @default(uuid())
  userId        String
  user          User            @relation(fields: [userId], references: [id])
  amount        Decimal         @db.Decimal(15, 2)
  type          TransactionType
  balanceBefore Decimal         @db.Decimal(15, 2)
  balanceAfter  Decimal         @db.Decimal(15, 2)
  description   String?
  metadata      Json?
  createdAt     DateTime        @default(now())

  @@index([userId, createdAt])
  @@map("transactions")
}

enum TransactionType {
  TOPUP
  TRANSFER_IN
  TRANSFER_OUT
}

model Topup {
  id                    String      @id @default(uuid())
  userId                String
  user                  User        @relation(fields: [userId], references: [id])
  amount                Decimal     @db.Decimal(15, 2)
  status                TopupStatus @default(PENDING)
  externalTransactionId String?     @unique
  idempotencyKey        String?     @unique
  createdAt             DateTime    @default(now())
  updatedAt             DateTime    @updatedAt

  @@index([userId, status])
  @@map("topups")
}

enum TopupStatus {
  PENDING
  SUCCESS
  FAILED
}

model Transfer {
  id             String   @id @default(uuid())
  fromUserId     String
  fromUser       User     @relation("SentTransfers", fields: [fromUserId], references: [id])
  toUserId       String
  toUser         User     @relation("ReceivedTransfers", fields: [toUserId], references: [id])
  amount         Decimal  @db.Decimal(15, 2)
  idempotencyKey String?  @unique
  createdAt      DateTime @default(now())

  @@index([fromUserId, createdAt])
  @@index([toUserId, createdAt])
  @@map("transfers")
}

model IdempotencyKey {
  key       String   @id
  result    Json?
  createdAt DateTime @default(now())
  expiresAt DateTime

  @@map("idempotency_keys")
}
```

### Generate Prisma Client

```bash
npx prisma generate
npx prisma db push
```

## Transaction Management Example

### TypeORM Transaction Example

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class TransferService {
  constructor(
    private dataSource: DataSource,
  ) {}

  async createTransfer(
    fromUserId: string,
    createTransferDto: CreateTransferDto,
  ): Promise<Transfer> {
    // Use transaction to ensure atomicity
    return await this.dataSource.transaction(async (manager) => {
      // Lock users for update to prevent race conditions
      const fromUser = await manager.findOne(User, {
        where: { id: fromUserId },
        lock: { mode: 'pessimistic_write' },
      });

      const toUser = await manager.findOne(User, {
        where: { username: createTransferDto.recipientUsername },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromUser || !toUser) {
        throw new NotFoundException('User not found');
      }

      // Validate
      if (fromUser.balance < createTransferDto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // Update balances
      fromUser.balance -= createTransferDto.amount;
      toUser.balance += createTransferDto.amount;

      await manager.save(User, fromUser);
      await manager.save(User, toUser);

      // Create transfer record
      const transfer = manager.create(Transfer, {
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: createTransferDto.amount,
      });

      return await manager.save(Transfer, transfer);
    });
  }
}
```

## Performance Optimization

### 1. Add Indexes

Already included in entity definitions above. Key indexes:
- `userId` + `createdAt` for transaction history
- `username` for user lookups
- `externalTransactionId` for webhook processing

### 2. Connection Pooling

TypeORM uses connection pooling by default. Configure in `app.module.ts`:

```typescript
{
  extra: {
    max: 20, // Maximum pool size
    idleTimeoutMillis: 30000,
  }
}
```

### 3. Query Optimization

Use `select` to fetch only needed fields:

```typescript
const user = await this.userRepository.findOne({
  where: { id: userId },
  select: ['id', 'username', 'balance'],
});
```

## Testing

### In-Memory Database for Tests

Use SQLite for testing:

```typescript
// test configuration
{
  type: 'sqlite',
  database: ':memory:',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
}
```

## Migration from In-Memory

The existing `DatabaseService` can coexist during migration:

1. Set up TypeORM alongside existing in-memory service
2. Gradually migrate services to use repositories
3. Remove `DatabaseService` once all services are migrated
4. Update `CommonModule` to remove `DatabaseService`

This allows for zero-downtime migration.
