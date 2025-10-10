import { Injectable } from '@nestjs/common';
import { Transaction } from '../balance/entities/transaction.entity';
import { DatabaseService } from '../common/database.service';

/**
 * Transaction Repository
 * Handles all database operations related to transactions
 */
@Injectable()
export class TransactionRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async save(transaction: Transaction): Promise<Transaction> {
    await this.databaseService.run(
      `
      INSERT INTO transactions (id, user_id, type, amount, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
      [
        transaction.id,
        transaction.userId,
        transaction.type,
        transaction.amount,
        transaction.description,
        transaction.createdAt.toISOString(),
      ],
    );
    return transaction;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const rows = await this.databaseService.all(
      'SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    );
    return rows.map((row) => this.mapRowToTransaction(row));
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
