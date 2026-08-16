import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const TIPOS_REACAO = ['curtir', 'amei', 'parabens', 'apoio', 'genial'];

export class ReagirDto {
  @IsString({ message: 'O tipo de reação deve ser uma string' })
  @IsNotEmpty({ message: 'O tipo de reação é obrigatório' })
  @IsIn(TIPOS_REACAO, {
    message: `Tipo de reação deve ser: ${TIPOS_REACAO.join(', ')}`,
  })
  @ApiProperty({
    enum: TIPOS_REACAO,
    description: 'Tipo da reação à publicação',
  })
  readonly tipo: string;
}
