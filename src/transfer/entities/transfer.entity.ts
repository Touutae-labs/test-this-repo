/**
 * Transfer Entity
 * Represents a money transfer between users
 */
export class Transfer {
  id: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  status?: string;
  idempotencyKey?: string;
  createdAt: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Transfer>) {
    Object.assign(this, partial);
  }
}
