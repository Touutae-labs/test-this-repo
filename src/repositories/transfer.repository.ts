import { Injectable } from '@nestjs/common';
import { Transfer } from '../transfer/entities/transfer.entity';
import * as sqlite3 from 'sqlite3';

/**
 * Transfer Repository
 * Handles all database operations related to transfers
 */
@Injectable()
export class TransferRepository {
  constructor(
    private readonly dbGet: (sql: string, params?: any[]) => Promise<any>,
    private readonly dbAll: (sql: string, params?: any[]) => Promise<any[]>,
    private readonly dbRun: (
      sql: string,
      params?: any[],
    ) => Promise<sqlite3.RunResult>,
  ) {}

  async save(transfer: Transfer): Promise<Transfer> {
    await this.dbRun(
      `
      INSERT OR REPLACE INTO transfers (id, from_user_id, to_user_id, amount, status, idempotency_key, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
      [
        transfer.id,
        transfer.fromUserId,
        transfer.toUserId,
        transfer.amount,
        transfer.status || 'completed',
        transfer.idempotencyKey || null,
        transfer.createdAt.toISOString(),
        transfer.updatedAt
          ? transfer.updatedAt.toISOString()
          : new Date().toISOString(),
      ],
    );
    return transfer;
  }

  async findByUserId(userId: string): Promise<Transfer[]> {
    const rows = await this.dbAll(
      'SELECT * FROM transfers WHERE from_user_id = ? OR to_user_id = ? ORDER BY created_at DESC',
      [userId, userId],
    );
    return rows.map((row) => this.mapRowToTransfer(row));
  }

  async findByIdempotencyKey(key: string): Promise<Transfer | undefined> {
    const row = await this.dbGet(
      'SELECT * FROM transfers WHERE idempotency_key = ?',
      [key],
    );
    return row ? this.mapRowToTransfer(row) : undefined;
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
