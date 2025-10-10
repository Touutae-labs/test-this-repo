import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @Column({ nullable: true, default: 0 })
  failedLoginAttempts?: number;

  @Column({ type: 'datetime', nullable: true })
  lockedUntil?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}
