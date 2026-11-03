import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Headers,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StaffService } from './staff.service.js';
import { CreateStaffDto } from './dto/create-staff.dto.js';
import { UpdateStaffDto, UpdateProfileDto } from './dto/update-staff.dto.js';
import { LoginStaffDto, ResetPasswordDto } from './dto/login-staff.dto.js';

@Controller('api/staff')
export class StaffController {
  constructor(private readonly staffService: StaffService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginStaffDto) {
    return this.staffService.login(dto);
  }

  @Get()
  findAll(@Headers('x-staff-id') staffId?: string) {
    return this.staffService.findAll(staffId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Headers('x-staff-id') staffId?: string) {
    return this.staffService.findOne(id, staffId);
  }

  @Post()
  create(@Body() dto: CreateStaffDto, @Headers('x-staff-id') staffId?: string) {
    return this.staffService.create(dto, staffId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.staffService.update(id, dto, staffId);
  }

  @Patch(':id')
  patchUpdate(
    @Param('id') id: string,
    @Body() dto: UpdateStaffDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.staffService.update(id, dto, staffId);
  }

  @Put(':id/profile')
  updateProfile(
    @Param('id') id: string,
    @Body() dto: UpdateProfileDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.staffService.updateProfile(id, dto, staffId);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string, @Headers('x-staff-id') staffId?: string) {
    return this.staffService.toggleStatus(id, staffId);
  }

  @Post(':id/reset-password')
  resetPassword(
    @Param('id') id: string,
    @Body() dto: ResetPasswordDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.staffService.resetPassword(id, dto.newPassword, staffId);
  }
}
