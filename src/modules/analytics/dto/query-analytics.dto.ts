import { IsDateString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryAnalyticsDto {
  @ApiPropertyOptional({
    description:
      'Data de início para o filtro (formato ISO 8601, ex: 2025-06-01)',
    example: '2024-06-01',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'Data final para o filtro (formato ISO 8601, ex: 2025-06-05)',
    example: '2025-10-06',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}
