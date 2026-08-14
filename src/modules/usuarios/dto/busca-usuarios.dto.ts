import { IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class BuscaUsuarioFilterDto {
  @ApiProperty({
    description: 'Numeração da página da requisição...',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(undefined, {
    message: 'O número da página tem que ser um número inteiro!',
  })
  readonly pagina?: number;

  @ApiProperty({
    description: 'Quantidade de itens por página...',
  })
  @Transform(({ value }) => Number(value))
  @IsNumber(undefined, {
    message: 'O número de itens por página tem que ser um número inteiro!',
  })
  readonly itensPorPagina?: number;

  @ApiProperty({
    required: false,
    description:
      'Busca por nome do usuário (default) ou nos outros campos do usuário...',
  })
  @IsOptional()
  @IsString({ message: 'O nome do usuário tem que ser uma String' })
  readonly busca?: string;

  @ApiProperty({
    required: false,
    description: 'Filtro por nome do campo a ser filtrado...',
  })
  @IsOptional()
  @IsString({
    message: 'O nome do campo a ser filtrado tem que ser uma String',
  })
  readonly filtro?: string;

  @ApiProperty({
    required: false,
    description: 'Valor do campo a ser filtrado...',
  })
  @IsOptional()
  @IsString({
    message: 'O valor do  campo a ser filtrado tem que ser uma String',
  })
  readonly valor?: string;
}
