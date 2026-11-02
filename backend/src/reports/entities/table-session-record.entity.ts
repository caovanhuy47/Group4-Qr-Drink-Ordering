import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export interface OrderItemSnapshot {
  itemId: string;
  dishId: string;
  name: string;
  sizeName: string;
  toppings: string[];
  notes: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

@Entity('table_session_records')
export class TableSessionRecord {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  sessionId: string; // e.g. "LT-2801"

  @Column({ type: 'varchar', length: 50 })
  tableNumber: string; // e.g. "BÀN 02", "BÀN 05"

  @Column({ type: 'varchar', length: 100, default: 'Vỉa hè trước quán' })
  area: string;

  @Column({ type: 'varchar', length: 30, default: 'served_paid' })
  status: 'ordered' | 'seated' | 'completed'; // ordered: chưa thu, seated: đã thu tiền còn ngồi, completed: đã trống bàn

  @Column({ type: 'datetime' })
  firstOrderAt: Date;

  @Column({ type: 'datetime', nullable: true })
  confirmedAt: Date | null; // Thời điểm xác nhận phục vụ & thu tiền

  @Column({ type: 'varchar', length: 100, nullable: true })
  confirmedBy: string | null; // Tên nhân viên/quản lý xác nhận thu tiền

  @Column({ type: 'datetime', nullable: true })
  completedAt: Date | null; // Thời điểm bàn trở về Trống

  @Column({ type: 'int', default: 0 })
  totalQuantity: number; // Tổng số phần món đã gọi

  @Column({ type: 'int', default: 0 })
  totalAmount: number; // Tổng tiền VNĐ nguyên

  @Column({ type: 'json' })
  items: OrderItemSnapshot[]; // Snapshot bất biến của các món tại thời điểm đặt

  @CreateDateColumn()
  createdAt: Date;
}
