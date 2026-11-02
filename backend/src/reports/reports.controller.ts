import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { QueryOverviewDto } from './dto/query-overview.dto.js';
import { QueryPaymentHistoryDto } from './dto/query-payment-history.dto.js';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto.js';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  getOverview(@Query() query: QueryOverviewDto) {
    return this.reportsService.getOverview(query);
  }

  @Get('payment-history')
  getPaymentHistory(@Query() query: QueryPaymentHistoryDto) {
    return this.reportsService.getPaymentHistory(query);
  }

  @Get('payment-history/:id')
  getPaymentDetail(@Param('id') id: string) {
    return this.reportsService.getPaymentDetail(id);
  }

  @Post('payments')
  recordPayment(
    @Body() dto: CreatePaymentRecordDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.reportsService.recordPayment(dto, staffId);
  }
}
