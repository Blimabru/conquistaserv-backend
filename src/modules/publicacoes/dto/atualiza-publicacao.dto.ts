import { CriaPublicacaoDto } from './cria-publicacao.dto';
import { PartialType } from '@nestjs/swagger';

export class AtualizaPublicacaoDto extends PartialType(CriaPublicacaoDto) {}
