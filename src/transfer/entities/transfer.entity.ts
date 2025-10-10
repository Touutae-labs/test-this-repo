import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

/**
 * Transfer Entity
 * Represents a money transfer between users
 */
@Entity('transfers')
export class Transfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fromUserId: string;

  @Column()
  toUserId: string;

  @Column('decimal', { precision: 15, scale: 2 })
  amount: number;

  @Column({ default: 'SUCCESS' })
  status?: string;

  @Column({ nullable: true })
  idempotencyKey?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;

  constructor(partial: Partial<Transfer>) {
    Object.assign(this, partial);
  }
}
