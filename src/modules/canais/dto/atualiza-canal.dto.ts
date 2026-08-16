import { CriaCanalDto } from './cria-canal.dto';
import { PartialType } from '@nestjs/swagger';

export class AtualizaCanalDto extends PartialType(CriaCanalDto) {}
