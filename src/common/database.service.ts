import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { UserRepository } from '../repositories/user.repository';
import { ApiKeyRepository } from '../repositories/api-key.repository';
import { TransactionRepository } from '../repositories/transaction.repository';
import { TopupRepository } from '../repositories/topup.repository';
import { TransferRepository } from '../repositories/transfer.repository';

/**
 * Database Service
 * Manages database connection and provides repository instances
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: sqlite3.Database;
  private dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  private dbGet: (sql: string, params?: any[]) => Promise<any>;
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

  // Repository instances
  public userRepository: UserRepository;
  public apiKeyRepository: ApiKeyRepository;
  public transactionRepository: TransactionRepository;
  public topupRepository: TopupRepository;
  public transferRepository: TransferRepository;

  async onModuleInit() {
    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Initialize SQLite connection
    this.db = new sqlite3.Database('./data/ewallet.db');
    
    // Promisify database methods
    this.dbRun = promisify(this.db.run.bind(this.db));
    this.dbGet = promisify(this.db.get.bind(this.db));
    this.dbAll = promisify(this.db.all.bind(this.db));

    await this.initializeTables();

    // Initialize repositories
    this.userRepository = new UserRepository(this.db, this.dbGet, this.dbRun);
    this.apiKeyRepository = new ApiKeyRepository(this.dbGet, this.dbRun);
    this.transactionRepository = new TransactionRepository(this.dbAll, this.dbRun);
    this.topupRepository = new TopupRepository(this.dbGet, this.dbAll, this.dbRun);
    this.transferRepository = new TransferRepository(this.dbGet, this.dbAll, this.dbRun);

    console.log('✅ SQLite3 database initialized with repositories');
  }

  async onModuleDestroy() {
    if (this.db) {
      await new Promise<void>((resolve) => {
        this.db.close((err) => {
          if (err) console.error('Database close error:', err);
          resolve();
        });
      });
    }
  }

  private async initializeTables(): Promise<void> {
    // Enable foreign keys
    await this.dbRun('PRAGMA foreign_keys = ON');

    // Users table
    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        balance REAL DEFAULT 0,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    // API keys table with expiration
    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS api_keys (
        api_key TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL,
        last_used_at TEXT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Transactions table
    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS transactions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        description TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Topups table
    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS topups (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        external_transaction_id TEXT,
        idempotency_key TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Transfers table
    await this.dbRun(`
      CREATE TABLE IF NOT EXISTS transfers (
        id TEXT PRIMARY KEY,
        from_user_id TEXT NOT NULL,
        to_user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL,
        idempotency_key TEXT UNIQUE,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (to_user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes for performance
    await this.dbRun('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)');
    await this.dbRun('CREATE INDEX IF NOT EXISTS idx_api_keys_expires ON api_keys(expires_at)');
    await this.dbRun('CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id)');
    await this.dbRun('CREATE INDEX IF NOT EXISTS idx_topups_user ON topups(user_id)');
    await this.dbRun('CREATE INDEX IF NOT EXISTS idx_transfers_users ON transfers(from_user_id, to_user_id)');
  }
}