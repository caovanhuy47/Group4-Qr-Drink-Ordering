import { IsString, IsOptional, IsBoolean, IsIn, MinLength } from 'class-validator';
import type { StaffRole, StaffStatus } from '../entities/staff.entity.js';

export class UpdateStaffDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'waiter', 'kitchen', 'cashier'], { message: 'Vai trò không hợp lệ' })
  role?: StaffRole;

  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'suspended'], { message: 'Trạng thái không hợp lệ' })
  status?: StaffStatus;

  @IsString()
  @IsOptional()
  @MinLength(4, { message: 'Mật khẩu phải có tối thiểu 4 ký tự' })
  password?: string;

  // Granular Permissions
  @IsBoolean()
  @IsOptional()
  canViewTables?: boolean;

  @IsBoolean()
  @IsOptional()
  canCollectMoney?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageTables?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewOverview?: boolean;

  @IsBoolean()
  @IsOptional()
  canViewHistory?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageMenu?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageBanners?: boolean;

  @IsBoolean()
  @IsOptional()
  canManageStaff?: boolean;
}

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  shift?: string;
}
