import { IsString, IsNotEmpty, IsArray, IsInt, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemValidateDto {
  @IsString()
  @IsNotEmpty()
  cartItemId: string;

  @IsString()
  @IsNotEmpty()
  dishId: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  sizeId?: string;

  @IsString()
  @IsOptional()
  sizeName?: string;

  @IsArray()
  @IsOptional()
  toppings?: string[];

  @Type(() => Number)
  @IsInt()
  @Min(1)
  quantity: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  clientUnitPrice: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  clientTotalPrice: number;
}

export class ValidateOrderDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsArray()
  @IsNotEmpty()
  items: OrderItemValidateDto[];
}
