import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity()
export class Ticker {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: null })
  name: string;

  @Column({ default: null })
  associatedBondingCurve: string;

  @Column({ default: null })
  bondingCurve: string;

  @Column({ default: null })
  creator: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  marketCap: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  usdMarketCap: number;

  @Column({ default: null })
  metadataUri: string;

  @Column({ default: null })
  raydiumPool: string;

  @Index()
  @Column({ default: null })
  mint: string;

  @CreateDateColumn({ type: 'timestamptz' })
  public createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updatedAt: Date;
}
