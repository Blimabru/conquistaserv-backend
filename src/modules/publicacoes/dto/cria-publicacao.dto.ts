import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
  IsIn,
  IsDateString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

const TIPOS_MIDIA = ['imagem', 'video'];

class MidiaDto {
  @IsIn(TIPOS_MIDIA, { message: `Tipo de mídia deve ser: ${TIPOS_MIDIA.join(', ')}` })
  @ApiProperty({ enum: TIPOS_MIDIA })
  readonly tipo: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'URL da mídia (retornada pelo upload)' })
  readonly url: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'URL do poster/thumbnail (para vídeos)' })
  readonly poster?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, default: 0 })
  readonly ordem?: number;
}

class PesquisaDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Pergunta da pesquisa de satisfação' })
  readonly pergunta: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, default: 5 })
  readonly escala?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: true })
  readonly permiteComentario?: boolean;
}

export class CriaPublicacaoDto {
  @IsString({ message: 'O ID do canal deve ser uma string' })
  @IsNotEmpty({ message: 'O canal é obrigatório' })
  @ApiProperty({ description: 'ID do canal de destino' })
  readonly canalId: string;

  @IsString({ message: 'O título deve ser uma string' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @ApiProperty()
  readonly titulo: string;

  @IsString({ message: 'O resumo deve ser uma string' })
  @IsNotEmpty({ message: 'O resumo é obrigatório' })
  @ApiProperty()
  readonly resumo: string;

  @IsString({ message: 'O corpo deve ser uma string' })
  @IsNotEmpty({ message: 'O corpo é obrigatório' })
  @ApiProperty({ description: 'Conteúdo HTML da publicação' })
  readonly corpo: string;

  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false, description: 'Data de publicação (ISO 8601)' })
  readonly dataPublicacao?: string;

  @IsOptional()
  @IsInt()
  @ApiProperty({ required: false, default: 0 })
  readonly prioridade?: number;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false, default: true })
  readonly reacoesHabilitadas?: boolean;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    required: false,
    default: false,
    description:
      'Só tem efeito em canal de secretaria: privada = só quem é da mesma secretaria vê. Em canal geral é ignorada.',
  })
  readonly privada?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MidiaDto)
  @ApiProperty({ required: false, type: [MidiaDto] })
  readonly midias?: MidiaDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PesquisaDto)
  @ApiProperty({ required: false, type: PesquisaDto })
  readonly pesquisa?: PesquisaDto;
}
