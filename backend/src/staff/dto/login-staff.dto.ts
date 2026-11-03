import { IsString, IsNotEmpty, MinLength } from 'class-validator';

export class LoginStaffDto {
  @IsString()
  @IsNotEmpty({ message: 'Tên đăng nhập hoặc mã nhân viên không được để trống' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu không được để trống' })
  password: string;
}

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Mật khẩu mới không được để trống' })
  @MinLength(4, { message: 'Mật khẩu mới phải có tối thiểu 4 ký tự' })
  newPassword: string;
}
