import { Controller, Get, Post, Patch, Delete, Param, Body, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiSearchOperation,
  ApiUpdateOperation,
} from 'src/common/documentation';
import { NivelMinimo } from 'src/common/decorators';
import { AccessTokenRequest } from 'src/common/interfaces';
import { BeneficiosService } from './beneficios.service';
import { CriaBeneficioDto } from './dto/cria-beneficio.dto';
import { AtualizaBeneficioDto } from './dto/atualiza-beneficio.dto';

@ApiBearerAuth()
@NivelMinimo('USUARIO')
@Controller('beneficios')
@ApiTags('Benefícios')
export class BeneficiosController {
  constructor(private readonly beneficiosService: BeneficiosService) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  @Get()
  @ApiSearchOperation({
    summary: 'Lista benefícios',
    description: 'Usuário comum vê só ativos; admin vê todos (inclusive inativos).',
  })
  async listar(@Request() req: AccessTokenRequest) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.beneficiosService.listar(isAdmin);
  }

  @Get(':id')
  @ApiSearchOperation({
    summary: 'Busca um benefício pelo ID',
    description: 'Retorna o benefício com os anexos (downloads) inclusos.',
  })
  async buscarPorId(@Param('id') id: string) {
    return this.beneficiosService.buscarPorId(id);
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  @Post()
  @NivelMinimo('ADMIN')
  @ApiCreateOperation({
    summary: 'Criar benefício',
  })
  async criar(@Body() dados: CriaBeneficioDto) {
    return this.beneficiosService.criar(dados);
  }

  @Patch(':id')
  @NivelMinimo('ADMIN')
  @ApiUpdateOperation({
    summary: 'Editar benefício',
  })
  async atualizar(@Param('id') id: string, @Body() dados: AtualizaBeneficioDto) {
    return this.beneficiosService.atualizar(id, dados);
  }

  @Delete(':id')
  @NivelMinimo('ADMIN')
  @ApiDeleteOperation({
    summary: 'Excluir benefício (soft delete)',
  })
  async deletar(@Param('id') id: string) {
    return this.beneficiosService.deletar(id);
  }
}
