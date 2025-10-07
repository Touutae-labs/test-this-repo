/**
 * Top-up Entity
 * Represents a top-up transaction
 */
export enum TopupStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

export class Topup {
  id: string;
  userId: string;
  amount: number;
  status: TopupStatus;
  externalTransactionId?: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<Topup>) {
    Object.assign(this, partial);
  }
}
