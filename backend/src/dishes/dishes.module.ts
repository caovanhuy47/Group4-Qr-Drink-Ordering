import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dish } from './entities/dish.entity.js';
import { Category } from './entities/category.entity.js';
import { TableSessionRecord } from '../reports/entities/table-session-record.entity.js';
import { DishesService } from './dishes.service.js';
import { DishesController } from './dishes.controller.js';
import { StaffModule } from '../staff/staff.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Dish, Category, TableSessionRecord]), StaffModule],
  controllers: [DishesController],
  providers: [DishesService],
  exports: [DishesService],
})
export class DishesModule {}
