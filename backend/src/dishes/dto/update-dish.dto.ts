import { PartialType } from '@nestjs/mapped-types';
import { CreateDishDto } from './create-dish.dto.js';
import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateDishDto extends PartialType(CreateDishDto) {
  @IsBoolean()
  @IsOptional()
  isArchived?: boolean;
}
