import { IsNotEmpty, IsString, IsOptional, MaxLength, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateCategoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  id?: string;

  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là chuỗi ký tự' })
  @MaxLength(100, { message: 'Tên danh mục tối đa 100 ký tự' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  name: string;

  @IsOptional()
  @IsString({ message: 'Biểu tượng phải là chuỗi ký tự' })
  @MaxLength(50, { message: 'Biểu tượng tối đa 50 ký tự' })
  icon?: string;

  @IsOptional()
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  order?: number;
}
