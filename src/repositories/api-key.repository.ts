import { Injectable } from '@nestjs/common';
import * as sqlite3 from 'sqlite3';

/**
 * API Key Repository
 * Handles all database operations related to API keys
 */
@Injectable()
export class ApiKeyRepository {
  constructor(
    private readonly dbGet: (sql: string, params?: any[]) => Promise<any>,
    private readonly dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>,
  ) {}

  async save(apiKey: string, userId: string, expiresAt: Date): Promise<void> {
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

  async delete(apiKey: string): Promise<void> {
    await this.dbRun('DELETE FROM api_keys WHERE api_key = ?', [apiKey]);
  }

  async cleanupExpired(): Promise<number> {
    const result = await this.dbRun("DELETE FROM api_keys WHERE expires_at <= datetime('now')");
    return result.changes || 0;
  }
}
