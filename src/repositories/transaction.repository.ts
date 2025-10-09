import { Injectable } from '@nestjs/common';
import { Transaction } from '../balance/entities/transaction.entity';
import * as sqlite3 from 'sqlite3';

/**
 * Transaction Repository
 * Handles all database operations related to transactions
 */
@Injectable()
export class TransactionRepository {
  constructor(
    private readonly dbAll: (sql: string, params?: any[]) => Promise<any[]>,
    private readonly dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>,
  ) {}

  async save(transaction: Transaction): Promise<Transaction> {
    await this.dbRun(`
      INSERT INTO transactions (id, user_id, type, amount, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [transaction.id, transaction.userId, transaction.type, transaction.amount, transaction.description, transaction.createdAt.toISOString()]);
    return transaction;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const rows = await this.dbAll('SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(this.mapRowToTransaction);
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
}
