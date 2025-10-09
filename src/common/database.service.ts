import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';
import { Transaction } from '../balance/entities/transaction.entity';
import { Topup } from '../topup/entities/topup.entity';
import { Transfer } from '../transfer/entities/transfer.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private db: sqlite3.Database;
  private dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>;
  private dbGet: (sql: string, params?: any[]) => Promise<any>;
  private dbAll: (sql: string, params?: any[]) => Promise<any[]>;

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
    console.log('✅ SQLite3 database initialized');
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

  // User operations
  async saveUser(user: User): Promise<User> {
    await this.dbRun(`
      INSERT OR REPLACE INTO users (id, username, password, balance, failed_login_attempts, locked_until, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      user.id, user.username, user.password, user.balance,
      user.failedLoginAttempts || 0,
      user.lockedUntil?.toISOString() || null,
      user.createdAt.toISOString(), user.updatedAt.toISOString()
    ]);
    return user;
  }

  async findUserById(id: string): Promise<User | undefined> {
    const row = await this.dbGet('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapRowToUser(row) : undefined;
  }

  async findUserByUsername(username: string): Promise<User | undefined> {
    const row = await this.dbGet('SELECT * FROM users WHERE username = ?', [username]);
    return row ? this.mapRowToUser(row) : undefined;
  }

  // API Key operations with expiration
  async saveApiKey(apiKey: string, userId: string, expiresAt: Date): Promise<void> {
    await this.dbRun(`
      INSERT OR REPLACE INTO api_keys (api_key, user_id, expires_at, created_at, last_used_at)
      VALUES (?, ?, ?, ?, ?)
    `, [apiKey, userId, expiresAt.toISOString(), new Date().toISOString(), new Date().toISOString()]);
  }

  async findUserIdByApiKey(apiKey: string): Promise<string | undefined> {
    const row = await this.dbGet(`
      SELECT user_id FROM api_keys 
      WHERE api_key = ? AND expires_at > datetime('now')
    `, [apiKey]);
    
    if (row) {
      // Update last used timestamp
      await this.dbRun('UPDATE api_keys SET last_used_at = ? WHERE api_key = ?', 
        [new Date().toISOString(), apiKey]);
      return row.user_id;
    }
    return undefined;
  }

  async deleteApiKey(apiKey: string): Promise<void> {
    await this.dbRun('DELETE FROM api_keys WHERE api_key = ?', [apiKey]);
  }

  async cleanupExpiredApiKeys(): Promise<number> {
    const result = await this.dbRun("DELETE FROM api_keys WHERE expires_at <= datetime('now')");
    return result.changes || 0;
  }

  // Transaction operations
  async saveTransaction(transaction: Transaction): Promise<Transaction> {
    await this.dbRun(`
      INSERT INTO transactions (id, user_id, type, amount, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [transaction.id, transaction.userId, transaction.type, transaction.amount, transaction.description, transaction.createdAt.toISOString()]);
    return transaction;
  }

  async findTransactionsByUserId(userId: string): Promise<Transaction[]> {
    const rows = await this.dbAll('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(this.mapRowToTransaction);
  }

  // Topup operations
  async saveTopup(topup: Topup): Promise<Topup> {
    await this.dbRun(`
      INSERT OR REPLACE INTO topups (id, user_id, amount, status, external_transaction_id, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [topup.id, topup.userId, topup.amount, topup.status, topup.externalTransactionId, topup.idempotencyKey, topup.createdAt.toISOString(), topup.updatedAt.toISOString()]);
    return topup;
  }

  async findTopupById(id: string): Promise<Topup | undefined> {
    const row = await this.dbGet('SELECT * FROM topups WHERE id = ?', [id]);
    return row ? this.mapRowToTopup(row) : undefined;
  }

  async findTopupsByUserId(userId: string): Promise<Topup[]> {
    const rows = await this.dbAll('SELECT * FROM topups WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(this.mapRowToTopup);
  }

  async findTopupByIdempotencyKey(key: string): Promise<Topup | undefined> {
    const row = await this.dbGet('SELECT * FROM topups WHERE idempotency_key = ?', [key]);
    return row ? this.mapRowToTopup(row) : undefined;
  }

  // Transfer operations
  async saveTransfer(transfer: Transfer): Promise<Transfer> {
    await this.dbRun(`
      INSERT OR REPLACE INTO transfers (id, from_user_id, to_user_id, amount, status, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [transfer.id, transfer.fromUserId, transfer.toUserId, transfer.amount, transfer.status, transfer.idempotencyKey, transfer.createdAt.toISOString(), transfer.updatedAt.toISOString()]);
    return transfer;
  }

  async findTransfersByUserId(userId: string): Promise<Transfer[]> {
    const rows = await this.dbAll('SELECT * FROM transfers WHERE from_user_id = ? OR to_user_id = ? ORDER BY created_at DESC', [userId, userId]);
    return rows.map(this.mapRowToTransfer);
  }

  async findTransferByIdempotencyKey(key: string): Promise<Transfer | undefined> {
    const row = await this.dbGet('SELECT * FROM transfers WHERE idempotency_key = ?', [key]);
    return row ? this.mapRowToTransfer(row) : undefined;
  }

  // Helper mapping methods
  private mapRowToUser(row: any): User {
    return new User({
      id: row.id,
      username: row.username,
      password: row.password,
      balance: row.balance,
      failedLoginAttempts: row.failed_login_attempts,
      lockedUntil: row.locked_until ? new Date(row.locked_until) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapRowToTransaction(row: any): Transaction {
    return new Transaction({
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      createdAt: new Date(row.created_at),
    });
  }

  private mapRowToTopup(row: any): Topup {
    return new Topup({
      id: row.id,
      userId: row.user_id,
      amount: row.amount,
      status: row.status,
      externalTransactionId: row.external_transaction_id,
      idempotencyKey: row.idempotency_key,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  private mapRowToTransfer(row: any): Transfer {
    return new Transfer({
      id: row.id,
      fromUserId: row.from_user_id,
      toUserId: row.to_user_id,
      amount: row.amount,
      status: row.status,
      idempotencyKey: row.idempotency_key,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}