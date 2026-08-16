import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CriaServicoDto {
  @IsString({ message: 'O nome do serviço deve ser uma string' })
  @IsNotEmpty({ message: 'O nome do serviço é obrigatório' })
  @ApiProperty({ description: 'Nome do serviço' })
  readonly nome: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser uma string' })
  @ApiProperty({ required: false, description: 'Descrição curta do serviço' })
  readonly descricao?: string;

  @IsOptional()
  @IsString({ message: 'O ícone deve ser uma string' })
  @ApiProperty({ required: false, default: 'apps', description: 'Nome do Material Icon' })
  readonly icone?: string;

  @IsOptional()
  @IsString({ message: 'A categoria deve ser uma string' })
  @ApiProperty({ required: false, description: 'Categoria livre (ex: Financeiro, Saúde)' })
  readonly categoria?: string;

  @IsOptional()
  @IsString({ message: 'A URL de ação deve ser uma string' })
  @ApiProperty({
    required: false,
    description: 'Rota interna ("/beneficios") ou link externo (http...) do botão de ação',
  })
  readonly urlAcao?: string;

  @IsOptional()
  @IsString({ message: 'O rótulo de ação deve ser uma string' })
  @ApiProperty({ required: false, default: 'Acessar', description: 'Texto do botão de ação' })
  readonly labelAcao?: string;

  @IsOptional()
  @IsBoolean({ message: 'O campo acessoRapido deve ser booleano' })
  @ApiProperty({ required: false, default: false, description: 'Aparece na vitrine "Mais acessados"' })
  readonly acessoRapido?: boolean;

  @IsOptional()
  @IsBoolean({ message: 'O campo ativo deve ser booleano' })
  @ApiProperty({ required: false, default: true, description: 'Visível na tela pública' })
  readonly ativo?: boolean;
}
