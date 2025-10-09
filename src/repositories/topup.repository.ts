import { Injectable } from '@nestjs/common';
import { Topup } from '../topup/entities/topup.entity';
import * as sqlite3 from 'sqlite3';

/**
 * Topup Repository
 * Handles all database operations related to topups
 */
@Injectable()
export class TopupRepository {
  constructor(
    private readonly dbGet: (sql: string, params?: any[]) => Promise<any>,
    private readonly dbAll: (sql: string, params?: any[]) => Promise<any[]>,
    private readonly dbRun: (
      sql: string,
      params?: any[],
    ) => Promise<sqlite3.RunResult>,
  ) {}

  async save(topup: Topup): Promise<Topup> {
    await this.dbRun(
      `
      INSERT OR REPLACE INTO topups (id, user_id, amount, status, external_transaction_id, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        topup.id,
        topup.userId,
        topup.amount,
        topup.status,
        topup.externalTransactionId,
        topup.idempotencyKey,
        topup.createdAt.toISOString(),
        topup.updatedAt.toISOString(),
      ],
    );
    return topup;
  }

  async findById(id: string): Promise<Topup | undefined> {
    const row = await this.dbGet('SELECT * FROM topups WHERE id = ?', [id]);
    return row ? this.mapRowToTopup(row) : undefined;
  }

  async findByUserId(userId: string): Promise<Topup[]> {
    const rows = await this.dbAll(
      'SELECT * FROM topups WHERE user_id = ? ORDER BY created_at DESC',
      [userId],
    );
    return rows.map((row) => this.mapRowToTopup(row));
  }

  async findByIdempotencyKey(key: string): Promise<Topup | undefined> {
    const row = await this.dbGet(
      'SELECT * FROM topups WHERE idempotency_key = ?',
      [key],
    );
    return row ? this.mapRowToTopup(row) : undefined;
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
}
