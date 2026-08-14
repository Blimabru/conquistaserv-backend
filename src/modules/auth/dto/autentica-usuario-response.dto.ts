import { IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    description: 'Token de acesso JWT',
    example:
      'eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWFiOhIxZDZkMWNjMy0yM2JiLTQwOTktOWMyYS0yMDU1OTYyMzQ0MTYiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjU2NDczMDMsImV4cCI6MTcyNTY0ODIwM30.WFkZuKaeTDIDDGQll_4bk4MFIAm9DBTpUxdHJtB31j77SkYQ9LaTzGoHzrxA0SA9TmwnEF97AwxaH05AtiAMsw',
  })
  @IsString()
  readonly access_token: string;

  @ApiProperty({
    description: 'ID do usuário',
    example: '1d1e1cg3-23bb-4549-9c2a-205596234416',
  })
  @IsUUID('4')
  readonly user_id: string;

  @ApiProperty({
    description: 'Nível de acesso do usuário',
    example: 'ADMIN',
  })
  @IsString()
  readonly nivel: string;
}

export class LogoutResponseDto {
  @ApiProperty({ example: 200 })
  readonly statusCode: number;

  @ApiProperty({ example: 'Usuário desconectado com sucesso!' })
  readonly message: string;
}
