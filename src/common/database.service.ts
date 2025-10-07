import { Injectable } from '@nestjs/common';
import { User } from '../users/entities/user.entity';
import { Transaction } from '../balance/entities/transaction.entity';
import { Topup } from '../topup/entities/topup.entity';
import { Transfer } from '../transfer/entities/transfer.entity';

/**
 * In-Memory Database Service
 *
 * NOTE: This is a simple in-memory implementation for demonstration.
 * For production, replace this with a proper database (PostgreSQL, MySQL, MongoDB, etc.)
 *
 * CRITICAL: Implement proper data persistence layer
 */
@Injectable()
export class DatabaseService {
  private users: Map<string, User> = new Map();
  private transactions: Map<string, Transaction> = new Map();
  private topups: Map<string, Topup> = new Map();
  private transfers: Map<string, Transfer> = new Map();
  private apiKeys: Map<string, string> = new Map(); // apiKey -> userId

  // User operations
  saveUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  findUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  findUserByUsername(username: string): User | undefined {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Transaction operations
  saveTransaction(transaction: Transaction): Transaction {
    this.transactions.set(transaction.id, transaction);
    return transaction;
  }

  findTransactionsByUserId(userId: string): Transaction[] {
    return Array.from(this.transactions.values()).filter(
      (tx) => tx.userId === userId,
    );
  }

  // Top-up operations
  saveTopup(topup: Topup): Topup {
    this.topups.set(topup.id, topup);
    return topup;
  }

  findTopupById(id: string): Topup | undefined {
    return this.topups.get(id);
  }

  findTopupsByUserId(userId: string): Topup[] {
    return Array.from(this.topups.values()).filter(
      (topup) => topup.userId === userId,
    );
  }

  // Transfer operations
  saveTransfer(transfer: Transfer): Transfer {
    this.transfers.set(transfer.id, transfer);
    return transfer;
  }

  findTransfersByUserId(userId: string): Transfer[] {
    return Array.from(this.transfers.values()).filter(
      (transfer) =>
        transfer.fromUserId === userId || transfer.toUserId === userId,
    );
  }

  // API Key operations
  saveApiKey(apiKey: string, userId: string): void {
    this.apiKeys.set(apiKey, userId);
  }

  findUserIdByApiKey(apiKey: string): string | undefined {
    return this.apiKeys.get(apiKey);
  }
}
