import { IsNotEmpty, IsString, IsEmail, IsIn } from 'class-validator';
import { NIVEIS_VALIDOS, NivelAcesso } from 'src/common/constants';
import { ApiProperty } from '@nestjs/swagger';

export class CriaUsuarioDto {
  @IsString({ message: 'O nome do usuário tem que ser uma String' })
  @IsNotEmpty({ message: 'Faltou informar o nome do usuário' })
  @ApiProperty()
  readonly nome: string;

  @IsEmail(undefined, { message: 'Email invalido' })
  @ApiProperty()
  readonly email: string;

  @IsIn(NIVEIS_VALIDOS, {
    message: `O nível deve ser um dos seguintes: ${NIVEIS_VALIDOS.join(', ')}`,
  })
  @ApiProperty({ enum: NIVEIS_VALIDOS })
  readonly nivel: NivelAcesso;

  @IsString({ message: 'A situação tem que ser uma String' })
  @IsNotEmpty({ message: 'Faltou informar a situação do usuário' })
  @ApiProperty()
  readonly situacao: string;

  @IsString({ message: 'O login tem que ser uma String' })
  @IsNotEmpty({ message: 'Faltou informar o login do usuário' })
  @ApiProperty()
  readonly login: string;

  @IsString({ message: 'A senha tem que ser uma String' })
  @IsNotEmpty({ message: 'Faltou informar a senha do usuário' })
  @ApiProperty()
  senha: string;
}
