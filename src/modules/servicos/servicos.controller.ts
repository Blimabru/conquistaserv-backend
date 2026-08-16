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
import { ServicosService } from './servicos.service';
import { CriaServicoDto } from './dto/cria-servico.dto';
import { AtualizaServicoDto } from './dto/atualiza-servico.dto';

@ApiBearerAuth()
@NivelMinimo('USUARIO')
@Controller('servicos')
@ApiTags('Serviços')
export class ServicosController {
  constructor(private readonly servicosService: ServicosService) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  @Get()
  @ApiSearchOperation({
    summary: 'Lista serviços',
    description: 'Usuário comum vê só ativos; admin vê todos (inclusive inativos).',
  })
  async listar(@Request() req: AccessTokenRequest) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.servicosService.listar(isAdmin);
  }

  @Get('acesso-rapido')
  @ApiSearchOperation({
    summary: 'Serviços de acesso rápido',
    description: 'Retorna só os serviços ativos marcados como acesso rápido.',
  })
  async acessoRapido() {
    return this.servicosService.acessoRapido();
  }

  @Get(':id')
  @ApiSearchOperation({
    summary: 'Busca um serviço pelo ID',
  })
  async buscarPorId(@Param('id') id: string) {
    return this.servicosService.buscarPorId(id);
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  @Post()
  @NivelMinimo('ADMIN')
  @ApiCreateOperation({
    summary: 'Criar serviço',
  })
  async criar(@Body() dados: CriaServicoDto) {
    return this.servicosService.criar(dados);
  }

  @Patch(':id')
  @NivelMinimo('ADMIN')
  @ApiUpdateOperation({
    summary: 'Editar serviço',
  })
  async atualizar(@Param('id') id: string, @Body() dados: AtualizaServicoDto) {
    return this.servicosService.atualizar(id, dados);
  }

  @Delete(':id')
  @NivelMinimo('ADMIN')
  @ApiDeleteOperation({
    summary: 'Excluir serviço (soft delete)',
  })
  async deletar(@Param('id') id: string) {
    return this.servicosService.deletar(id);
  }
}
