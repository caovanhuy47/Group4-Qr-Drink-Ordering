import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type StaffRole = 'admin' | 'waiter' | 'kitchen' | 'cashier';
export type StaffStatus = 'active' | 'suspended';

@Entity('staff')
export class Staff {
  @PrimaryColumn({ type: 'varchar', length: 50 })
  id: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, default: 'waiter' })
  role: StaffRole;

  @Column({ type: 'varchar', length: 100, default: 'Nhân viên phục vụ' })
  roleName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 100, default: 'Ca linh hoạt' })
  shift: string;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: StaffStatus;

  // Granular Permissions
  @Column({ type: 'boolean', default: true })
  canViewTables: boolean;

  @Column({ type: 'boolean', default: false })
  canCollectMoney: boolean;

  @Column({ type: 'boolean', default: false })
  canManageTables: boolean;

  @Column({ type: 'boolean', default: false })
  canViewOverview: boolean;

  @Column({ type: 'boolean', default: false })
  canViewHistory: boolean;

  @Column({ type: 'boolean', default: false })
  canManageMenu: boolean;

  @Column({ type: 'boolean', default: false })
  canManageBanners: boolean;

  @Column({ type: 'boolean', default: false })
  canManageStaff: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
