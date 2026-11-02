import { IsString, IsNotEmpty, IsInt, Min, IsOptional, IsBoolean, IsArray, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import type { DishSizeOption, DishTopping } from '../entities/dish.entity.js';

export class CreateDishDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên món ăn không được để trống' })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Type(() => Number)
  @IsInt({ message: 'Giá bán phải là số nguyên' })
  @Min(0, { message: 'Giá bán không được âm' })
  price: number;

  @Type(() => Number)
  @IsInt({ message: 'Giá cũ phải là số nguyên' })
  @Min(0, { message: 'Giá cũ không được âm' })
  @IsOptional()
  oldPrice?: number;

  @IsString()
  @IsNotEmpty({ message: 'Ảnh món ăn không được để trống' })
  image: string;

  @IsString()
  @IsNotEmpty({ message: 'Danh mục món không được để trống' })
  categoryId: string;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  @IsIn(['hot', 'new', 'veg', 'special', ''], { message: 'Loại nhãn không hợp lệ' })
  badgeType?: 'hot' | 'new' | 'veg' | 'special';

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @IsArray()
  @IsOptional()
  sizes?: DishSizeOption[];

  @IsArray()
  @IsOptional()
  toppings?: DishTopping[];
}
