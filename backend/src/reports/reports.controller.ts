import { Controller, Get, Post, Body, Param, Query, Headers } from '@nestjs/common';
import { ReportsService } from './reports.service.js';
import { QueryOverviewDto } from './dto/query-overview.dto.js';
import { QueryPaymentHistoryDto } from './dto/query-payment-history.dto.js';
import { CreatePaymentRecordDto } from './dto/create-payment-record.dto.js';
import { CreateActiveOrderDto } from './dto/create-active-order.dto.js';
import { CompleteTableDto } from './dto/complete-table.dto.js';

@Controller('api/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('overview')
  getOverview(@Query() query: QueryOverviewDto, @Headers('x-staff-id') staffId?: string) {
    return this.reportsService.getOverview(query, staffId);
  }

  @Get('tables')
  getActiveTables() {
    return this.reportsService.getActiveTables();
  }

  @Post('active-orders')
  createActiveOrder(@Body() dto: CreateActiveOrderDto) {
    return this.reportsService.createOrAppendActiveOrder(dto);
  }

  @Post('tables/complete')
  completeTableSession(
    @Body() dto: CompleteTableDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.reportsService.completeTableSession(dto, staffId);
  }

  @Get('payment-history')
  getPaymentHistory(@Query() query: QueryPaymentHistoryDto, @Headers('x-staff-id') staffId?: string) {
    return this.reportsService.getPaymentHistory(query, staffId);
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

