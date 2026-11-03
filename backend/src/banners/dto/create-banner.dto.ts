import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import type { BannerLinkType } from '../entities/banner.entity.js';

export class CreateBannerDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên quản trị banner không được để trống' })
  adminName: string;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsNotEmpty({ message: 'Tiêu đề hiển thị không được để trống' })
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  discountBadge?: string;

  @IsString()
  @IsOptional()
  priceNote?: string;

  @IsString()
  @IsOptional()
  ctaText?: string;

  @IsString()
  @IsOptional()
  bgGradient?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  mobileImageUrl?: string;

  @IsString()
  @IsOptional()
  @IsIn(['none', 'dish', 'category', 'custom'], { message: 'Đích liên kết không hợp lệ' })
  linkType?: BannerLinkType;

  @IsString()
  @IsOptional()
  linkTargetId?: string;

  @Type(() => Number)
  @IsInt({ message: 'Thứ tự hiển thị phải là số nguyên' })
  @Min(0, { message: 'Thứ tự hiển thị không được âm' })
  @IsOptional()
  displayOrder?: number;

  @IsBoolean({ message: 'Trạng thái hiển thị phải là kiểu boolean' })
  @IsOptional()
  isActive?: boolean;
}
