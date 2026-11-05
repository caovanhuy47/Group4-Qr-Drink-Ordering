import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CompleteTableDto {
  @IsString()
  @IsNotEmpty()
  tableNumber: string;

  @IsString()
  @IsOptional()
  sessionId?: string;

  @IsString()
  @IsOptional()
  staffId?: string;
}

