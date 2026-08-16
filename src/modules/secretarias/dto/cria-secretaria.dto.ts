import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriaSecretariaDto {
  @IsString({ message: 'O nome da secretaria deve ser uma string' })
  @IsNotEmpty({ message: 'O nome da secretaria é obrigatório' })
  @ApiProperty({ description: 'Nome da secretaria' })
  readonly nome: string;

  @IsString({ message: 'A descrição deve ser uma string' })
  @IsNotEmpty({ message: 'A descrição da secretaria é obrigatória' })
  @ApiProperty({ description: 'Descrição da secretaria' })
  readonly descricao: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Cor hexadecimal do canal criado automaticamente (ex: #045DA5)' })
  readonly cor?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ required: false, description: 'Ícone (Material Icon) do canal criado automaticamente' })
  readonly icone?: string;
}
