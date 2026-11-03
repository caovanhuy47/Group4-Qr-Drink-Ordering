import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type BannerLinkType = 'none' | 'dish' | 'category' | 'custom';

@Entity('banners')
export class Banner {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 150 })
  adminName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  tag?: string | null;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  discountBadge?: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  priceNote?: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Khám phá ngay' })
  ctaText: string;

  @Column({ type: 'varchar', length: 150, default: 'from-primary via-primary-container to-secondary-container' })
  bgGradient: string;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  mobileImageUrl?: string | null;

  @Column({ type: 'varchar', length: 20, default: 'none' })
  linkType: BannerLinkType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  linkTargetId?: string | null;

  @Column({ type: 'int', default: 0 })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
