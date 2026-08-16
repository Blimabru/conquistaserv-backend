import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdicionaMembroDto {
  @IsString({ message: 'O ID do usuário deve ser uma string' })
  @IsNotEmpty({ message: 'O ID do usuário é obrigatório' })
  @ApiProperty({ description: 'ID do usuário a ser adicionado como membro' })
  readonly usuarioId: string;
}
