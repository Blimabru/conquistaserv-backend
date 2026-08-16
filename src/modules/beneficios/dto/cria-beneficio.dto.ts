import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class LocalDto {
  @IsString({ message: 'O nome do local deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do local é obrigatório' })
  @ApiProperty()
  readonly name: string;

  @IsString({ message: 'O endereço deve ser uma string' })
  @IsNotEmpty({ message: 'O endereço do local é obrigatório' })
  @ApiProperty()
  readonly address: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly phone?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly email?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false })
  readonly hours?: string;
}

class BeneficioDownloadDto {
  @IsString({ message: 'O nome do anexo deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do anexo é obrigatório' })
  @ApiProperty()
  readonly nome: string;

  @IsString({ message: 'A URL do anexo deve ser uma string' })
  @IsNotEmpty({ message: 'A URL do anexo é obrigatória' })
  @ApiProperty({ description: 'URL retornada pelo upload' })
  readonly url: string;

  @IsString({ message: 'O tipo do anexo deve ser uma string' })
  @IsNotEmpty({ message: 'O tipo do anexo é obrigatório' })
  @ApiProperty({ description: 'Extensão do arquivo (ex: PDF, DOCX)' })
  readonly tipo: string;

  @IsInt({ message: 'O tamanho deve ser um número inteiro (bytes)' })
  @ApiProperty({ description: 'Tamanho do arquivo em bytes' })
  readonly tamanho: number;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, default: 0 })
  readonly ordem?: number;
}

export class CriaBeneficioDto {
  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título do benefício é obrigatório' })
  @ApiProperty({ description: 'Título do benefício' })
  readonly titulo: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição do benefício é obrigatória' })
  @ApiProperty({ description: 'Descrição curta (card)' })
  readonly descricao: string;

  @IsOptional()
  @IsString({ message: 'A descrição longa deve ser uma string' })
  @ApiProperty({ required: false, description: 'Texto completo (tela de detalhe)' })
  readonly descricaoLonga?: string;

  @IsString({ message: 'O ícone deve ser uma string' })
  @IsNotEmpty({ message: 'O ícone do benefício é obrigatório' })
  @ApiProperty({ description: 'Nome do Material Icon' })
  readonly icone: string;

  @IsString({ message: 'A categoria deve ser uma string' })
  @IsNotEmpty({ message: 'A categoria do benefício é obrigatória' })
  @ApiProperty({ description: 'Categoria livre (ex: Saúde, Alimentação)' })
  readonly categoria: string;

  @IsOptional()
  @IsString({ message: 'O badge deve ser uma string' })
  @ApiProperty({ required: false, description: 'Selo opcional (ex: "Novo")' })
  readonly badge?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo destaque deve ser booleano' })
  @ApiProperty({
    required: false,
    default: false,
    description: 'Card de destaque no topo — só pode haver 1 por vez',
  })
  readonly destaque?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser booleano' })
  @ApiProperty({ required: false, default: true, description: 'Visível na tela pública' })
  readonly ativo?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String], description: 'Procedimentos cobertos' })
  readonly procedimentos?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({ required: false, type: [String], description: 'Regras de elegibilidade' })
  readonly elegibilidade?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LocalDto)
  @ApiProperty({ required: false, type: [LocalDto] })
  readonly locais?: LocalDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BeneficioDownloadDto)
  @ApiProperty({ required: false, type: [BeneficioDownloadDto] })
  readonly downloads?: BeneficioDownloadDto[];
}
