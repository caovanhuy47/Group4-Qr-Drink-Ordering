import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Headers,
} from '@nestjs/common';
import { BannersService } from './banners.service.js';
import { CreateBannerDto } from './dto/create-banner.dto.js';
import { UpdateBannerDto } from './dto/update-banner.dto.js';
import { ReorderBannersDto } from './dto/reorder-banners.dto.js';

@Controller('api/banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  findAll(@Query('includeInactive') includeInactive?: string) {
    const showAll = includeInactive === 'true' || includeInactive === '1';
    return this.bannersService.findAll(showAll);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bannersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBannerDto, @Headers('x-staff-id') staffId?: string) {
    return this.bannersService.create(dto, staffId);
  }

  @Put('reorder')
  reorder(@Body() dto: ReorderBannersDto, @Headers('x-staff-id') staffId?: string) {
    return this.bannersService.reorder(dto, staffId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.bannersService.update(id, dto, staffId);
  }

  @Patch(':id/status')
  toggleStatus(@Param('id') id: string, @Headers('x-staff-id') staffId?: string) {
    return this.bannersService.toggleStatus(id, staffId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Headers('x-staff-id') staffId?: string) {
    return this.bannersService.remove(id, staffId);
  }
}
