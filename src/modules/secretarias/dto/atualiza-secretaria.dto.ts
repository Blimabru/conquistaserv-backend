import { PartialType, OmitType } from '@nestjs/swagger';
import { CriaSecretariaDto } from './cria-secretaria.dto';

// Atualização não mexe no canal (cor/ícone só existem na criação) — só nome/descrição.
export class AtualizaSecretariaDto extends PartialType(
  OmitType(CriaSecretariaDto, ['cor', 'icone'] as const),
) {}
