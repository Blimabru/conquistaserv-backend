import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriaDocumentoDto {
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título do documento é obrigatório' })
  @ApiProperty({ description: 'Título do documento' })
  readonly titulo: string;

  @IsOptional()
  @IsString({ message: 'A versão deve ser uma string' })
  @ApiProperty({ required: false, default: 'v1.0' })
  readonly versao?: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição do documento é obrigatória' })
  @ApiProperty({ description: 'Descrição curta do documento' })
  readonly descricao: string;

  @IsString({ message: 'A categoria deve ser uma string' })
  @IsNotEmpty({ message: 'A categoria do documento é obrigatória' })
  @ApiProperty({ description: 'Categoria livre (ex: Administrativo, Educação)' })
  readonly categoria: string;

  @IsOptional()
  @IsString({ message: 'A cor da tag deve ser uma string' })
  @ApiProperty({ required: false, description: 'Cor hexadecimal da tag (ex: #E2007A)' })
  readonly corTag?: string;

  @IsString({ message: 'A URL deve ser uma string' })
  @IsNotEmpty({ message: 'O arquivo do documento é obrigatório' })
  @ApiProperty({ description: 'URL do arquivo (retornada pelo upload)' })
  readonly url: string;

  @IsOptional()
  @IsString({ message: 'O tipo deve ser uma string' })
  @ApiProperty({ required: false, description: 'Extensão do arquivo (ex: PDF, DOCX)' })
  readonly tipo?: string;

  @IsOptional()
  @IsInt({ message: 'O tamanho deve ser um número inteiro (bytes)' })
  @ApiProperty({ required: false, description: 'Tamanho do arquivo em bytes' })
  readonly tamanho?: number;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser booleano' })
  @ApiProperty({ required: false, default: true, description: 'Visível na tela pública' })
  readonly ativo?: boolean;
}
