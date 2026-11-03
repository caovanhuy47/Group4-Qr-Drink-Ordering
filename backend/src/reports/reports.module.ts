import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TableSessionRecord } from './entities/table-session-record.entity.js';
import { ReportsService } from './reports.service.js';
import { ReportsController } from './reports.controller.js';
import { StaffModule } from '../staff/staff.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([TableSessionRecord]), StaffModule],
  controllers: [ReportsController],
  providers: [ReportsService],
  exports: [ReportsService],
})
export class ReportsModule {}
