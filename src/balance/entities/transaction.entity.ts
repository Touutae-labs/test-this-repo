import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

/**
 * Transaction Entity
 * Represents a balance change transaction
 */
export enum TransactionType {
  TOPUP = 'TOPUP',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({
    type: 'varchar',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column('decimal', { precision: 15, scale: 2 })
  balanceBefore: number;

  @Column('decimal', { precision: 15, scale: 2 })
  balanceAfter: number;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  createdAt: Date;

  constructor(partial: Partial<Transaction>) {
    Object.assign(this, partial);
  }
}
