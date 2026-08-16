import { PartialType } from '@nestjs/swagger';
import { CriaServicoDto } from './cria-servico.dto';

export class AtualizaServicoDto extends PartialType(CriaServicoDto) {}
