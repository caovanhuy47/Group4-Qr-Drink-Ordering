import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity.js';
import { BannersService } from './banners.service.js';
import { BannersController } from './banners.controller.js';
import { StaffModule } from '../staff/staff.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Banner]), StaffModule],
  controllers: [BannersController],
  providers: [BannersService],
  exports: [BannersService],
})
export class BannersModule {}
