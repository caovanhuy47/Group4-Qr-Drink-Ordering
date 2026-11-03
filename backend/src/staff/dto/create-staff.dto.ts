import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn, MinLength } from 'class-validator';
import type { StaffRole, StaffStatus } from '../entities/staff.entity.js';

export class CreateStaffDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: 'Họ và tên nhân viên không được để trống' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập không được để trống' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu khởi tạo không được để trống' })
  @MinLength(4, { message: 'Mật khẩu phải có tối thiểu 4 ký tự' })
  password: string;

  @IsString()
  @IsOptional()
  @IsIn(['admin', 'waiter', 'kitchen', 'cashier'], { message: 'Vai trò không hợp lệ' })
  role?: StaffRole;

  @IsString()
  @IsOptional()
  roleName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  shift?: string;

  @IsString()
  @IsOptional()
  @IsIn(['active', 'suspended'], { message: 'Trạng thái không hợp lệ' })
  status?: StaffStatus;

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
