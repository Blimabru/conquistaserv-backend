import { PartialType } from '@nestjs/swagger';
import { CriaDocumentoDto } from './cria-documento.dto';

export class AtualizaDocumentoDto extends PartialType(CriaDocumentoDto) {}
