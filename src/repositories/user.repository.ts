import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import * as sqlite3 from 'sqlite3';

/**
 * User Repository
 * Handles all database operations related to users
 */
@Injectable()
export class UserRepository {
  constructor(
    private readonly db: sqlite3.Database,
    private readonly dbGet: (sql: string, params?: any[]) => Promise<any>,
    private readonly dbRun: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>,
  ) {}

  async save(user: User): Promise<User> {
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

  async findById(id: string): Promise<User | undefined> {
    const row = await this.dbGet('SELECT * FROM users WHERE id = ?', [id]);
    return row ? this.mapRowToUser(row) : undefined;
  }

  async findByUsername(username: string): Promise<User | undefined> {
    const row = await this.dbGet('SELECT * FROM users WHERE username = ?', [username]);
    return row ? this.mapRowToUser(row) : undefined;
  }

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
}
