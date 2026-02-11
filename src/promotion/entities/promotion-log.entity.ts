import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class PromotionLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  promotionType: string;

  @Column('decimal', { precision: 10, scale: 2 })
  originalAmount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  finalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  bonus: number;

  @Column()
  reason: string;

  @Column('text', { nullable: true })
  metadata: string;

  @CreateDateColumn()
  createdAt: Date;
}
