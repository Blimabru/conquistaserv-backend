import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const TIPOS_CANAL = ['PUBLICO', 'PRIVADO'];

export class CriaCanalDto {
  @IsString({ message: 'O nome do canal deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do canal é obrigatório' })
  @ApiProperty({ description: 'Nome do canal' })
  readonly nome: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição do canal é obrigatória' })
  @ApiProperty({ description: 'Descrição do canal' })
  readonly descricao: string;

  @IsIn(TIPOS_CANAL, { message: `Tipo deve ser: ${TIPOS_CANAL.join(', ')}` })
  @ApiProperty({ enum: TIPOS_CANAL, default: 'PUBLICO' })
  readonly tipo: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo oficial deve ser booleano' })
  @ApiProperty({
    required: false,
    default: false,
    description:
      'Marca este canal como o canal principal (destaque no topo do feed). Só pode haver um por vez — marcar este desmarca automaticamente o anterior.',
  })
  readonly oficial?: boolean;

  @IsString({ message: 'A cor deve ser uma string' })
  @IsNotEmpty({ message: 'A cor do canal é obrigatória' })
  @ApiProperty({ description: 'Cor hexadecimal do canal (ex: #045DA5)' })
  readonly cor: string;

  @IsString({ message: 'O ícone deve ser uma string' })
  @IsNotEmpty({ message: 'O ícone do canal é obrigatório' })
  @ApiProperty({ description: 'Nome do Material Icon (ex: campaign, groups)' })
  readonly icone: string;
}
