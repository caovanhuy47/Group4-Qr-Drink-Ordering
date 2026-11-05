import { IsString, IsNotEmpty, IsArray, IsOptional, IsInt, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ActiveOrderItemDto {
  @IsString()
  @IsOptional()
  itemId?: string;

  @IsString()
  @IsNotEmpty()
  dishId: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  sizeName?: string;

  @IsArray()
  @IsOptional()
  toppings?: string[];

  @IsString()
  @IsOptional()
  notes?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  unitPrice: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalPrice: number;
}

export class CreateActiveOrderDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsString()
  @IsOptional()
  area?: string;

  @IsString()
  @IsOptional()
  orderNotes?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  totalQuantity?: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @IsOptional()
  totalAmount?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActiveOrderItemDto)
  items: ActiveOrderItemDto[];
}

