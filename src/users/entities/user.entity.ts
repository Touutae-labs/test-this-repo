import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * User Entity
 * Represents a user in the e-wallet system
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string; // Should be hashed

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: 0 })
  failedLoginAttempts?: number;

  @Column({ nullable: true })
  lockedUntil?: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
