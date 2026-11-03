import { IsArray, ValidateNested, IsString, IsNotEmpty, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class BannerOrderItemDto {
  @IsString()
  @IsNotEmpty({ message: 'Mã banner không được để trống' })
  id: string;

  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  displayOrder: number;
}

export class ReorderBannersDto {
  @IsArray({ message: 'Danh sách thứ tự phải là một mảng' })
  @ValidateNested({ each: true })
  @Type(() => BannerOrderItemDto)
  items: BannerOrderItemDto[];
}
