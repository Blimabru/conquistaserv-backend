import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AutenticaUsuarioDto {
  @ApiProperty({
    description: 'Login do usuário',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty()
  readonly login: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: '123456',
  })
  @IsString()
  @IsNotEmpty()
  readonly senha: string;
}
