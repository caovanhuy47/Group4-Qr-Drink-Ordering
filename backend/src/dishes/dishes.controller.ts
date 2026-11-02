import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { DishesService } from './dishes.service.js';
import { CreateDishDto } from './dto/create-dish.dto.js';
import { UpdateDishDto } from './dto/update-dish.dto.js';
import { QueryDishDto } from './dto/query-dish.dto.js';
import { ValidateOrderDto } from './dto/validate-order.dto.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

@Controller('api/dishes')
export class DishesController {
  constructor(private readonly dishesService: DishesService) {}

  @Get('categories')
  findAllCategories() {
    return this.dishesService.findAllCategories();
  }

  @Get('categories/:id')
  findCategory(@Param('id') id: string) {
    return this.dishesService.findCategory(id);
  }

  @Post('categories')
  createCategory(
    @Body() dto: CreateCategoryDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.createCategory(dto, staffId);
  }

  @Put('categories/:id')
  updateCategory(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.updateCategory(id, dto, staffId);
  }

  @Delete('categories/:id')
  deleteCategory(
    @Param('id') id: string,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.deleteCategory(id, staffId);
  }

  @Post('validate-order')
  validateOrder(@Body() dto: ValidateOrderDto) {
    return this.dishesService.validateOrder(dto);
  }

  @Get()
  findAll(@Query() query: QueryDishDto) {
    return this.dishesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.dishesService.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateDishDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.create(dto, staffId);
  }

  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDishDto,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.update(id, dto, staffId);
  }

  @Patch(':id/status')
  toggleAvailability(
    @Param('id') id: string,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.toggleAvailability(id, staffId);
  }

  @Delete(':id')
  remove(
    @Param('id') id: string,
    @Headers('x-staff-id') staffId?: string,
  ) {
    return this.dishesService.remove(id, staffId);
  }
}
