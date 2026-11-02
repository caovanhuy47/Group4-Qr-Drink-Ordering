import { IsString, IsNotEmpty, IsInt, Min, IsArray, IsOptional } from 'class-validator';
import type { OrderItemSnapshot } from '../entities/table-session-record.entity.js';

export class CreatePaymentRecordDto {
  @IsString()
  @IsNotEmpty()
  sessionId: string;

  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsNotEmpty()
  firstOrderAt: string;

  @IsString()
  @IsOptional()
  confirmedAt?: string;

  @IsString()
  @IsOptional()
  confirmedBy?: string;

  @IsString()
  @IsOptional()
  staffId?: string;

  @IsInt()
  @Min(1)
  totalQuantity: number;

  @IsInt()
  @Min(0)
  totalAmount: number;

  @IsArray()
  items: OrderItemSnapshot[];
}
