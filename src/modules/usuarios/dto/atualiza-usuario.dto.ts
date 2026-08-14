import { CriaUsuarioDto } from './cria-usuario.dto';
import { PartialType } from '@nestjs/swagger';

export class AtualizaUsuarioDto extends PartialType(CriaUsuarioDto) {}
