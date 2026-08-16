import { PartialType } from '@nestjs/swagger';
import { CriaBeneficioDto } from './cria-beneficio.dto';

export class AtualizaBeneficioDto extends PartialType(CriaBeneficioDto) {}
