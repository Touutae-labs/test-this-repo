/**
 * Transaction Entity
 * Represents a balance change transaction
 */
export enum TransactionType {
  TOPUP = 'TOPUP',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

export class Transaction {
  id: string;
  userId: string;
  amount: number;
  type: TransactionType;
  balanceBefore: number;
  balanceAfter: number;
  description?: string;
  metadata?: any;
  createdAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
