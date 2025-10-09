/**
 * User Entity
 * Represents a user in the e-wallet system
 */
export class User {
  id: string;
  username: string;
  password: string; // Should be hashed
  balance: number;
  failedLoginAttempts?: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
