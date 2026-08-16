import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BuscaCanaisDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber(undefined, { message: 'pagina deve ser um número' })
  readonly pagina?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @Transform(({ value }) => Number(value))
  @IsNumber(undefined, { message: 'itensPorPagina deve ser um número' })
  readonly itensPorPagina?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString({ message: 'busca deve ser uma string' })
  readonly busca?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly filtro?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  readonly valor?: string;
}
