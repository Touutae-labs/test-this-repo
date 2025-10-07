/**
 * User Entity
 * Represents a user in the e-wallet system
 */
export class User {
  id: string;
  username: string;
  password: string; // Should be hashed
  balance: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
