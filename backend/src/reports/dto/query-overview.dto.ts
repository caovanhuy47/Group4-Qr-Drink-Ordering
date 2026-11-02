import { IsOptional, IsString, IsIn } from 'class-validator';

export class QueryOverviewDto {
  @IsOptional()
  @IsIn(['today', '7days', 'this_month', 'custom'])
  period?: 'today' | '7days' | 'this_month' | 'custom' = 'today';

  @IsOptional()
  @IsString()
  startDate?: string; // YYYY-MM-DD

  @IsOptional()
  @IsString()
  endDate?: string; // YYYY-MM-DD
}

