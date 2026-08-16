import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RespondePesquisaDto {
  @IsInt({ message: 'A nota deve ser um número inteiro' })
  @Min(1, { message: 'A nota mínima é 1' })
  @Max(5, { message: 'A nota máxima é 5' })
  @ApiProperty({ description: 'Nota de 1 a 5', minimum: 1, maximum: 5 })
  readonly nota: number;

  @IsOptional()
  @IsString({ message: 'O comentário deve ser uma string' })
  @ApiProperty({ required: false, description: 'Comentário opcional' })
  readonly comentario?: string;
}
