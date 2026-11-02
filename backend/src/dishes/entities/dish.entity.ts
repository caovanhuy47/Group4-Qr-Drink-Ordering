import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export interface DishSizeOption {
  id: string;
  name: string;
  price: number;
}

export interface DishTopping {
  id: string;
  name: string;
  price: number;
}

@Entity('dishes')
export class Dish {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', default: 0 })
  price: number;

  @Column({ type: 'int', nullable: true })
  oldPrice?: number | null;

  @Column({ type: 'text' })
  image: string;

  @Column({ type: 'varchar', length: 50 })
  categoryId: string;

  @Column({ type: 'varchar', length: 100 })
  categoryName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  badge?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  badgeType?: 'hot' | 'new' | 'veg' | 'special' | null;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'boolean', default: false })
  isArchived: boolean;

  @Column({ type: 'json', nullable: true })
  sizes: DishSizeOption[];

  @Column({ type: 'json', nullable: true })
  toppings: DishTopping[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
