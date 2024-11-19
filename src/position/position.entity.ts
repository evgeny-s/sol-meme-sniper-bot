import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEnum } from './enum/status.enum';

@Entity()
export class Position {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  raydiumPool: string;

  @Column({ default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  price: number;

  @Column({
    type: 'enum',
    enum: StatusEnum,
    nullable: true,
  })
  public status: StatusEnum;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt: Date;
}
