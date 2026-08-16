import {
  Controller,
  Get,
  Post,
  Patch,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiSearchOperation,
  ApiUpdateOperation,
} from 'src/common/documentation';
import { NivelMinimo } from 'src/common/decorators';
import { AccessTokenRequest } from 'src/common/interfaces';
import { CanaisService } from './canais.service';
import { CriaCanalDto } from './dto/cria-canal.dto';
import { AtualizaCanalDto } from './dto/atualiza-canal.dto';
import { AdicionaMembroDto } from './dto/adiciona-membro.dto';

@ApiBearerAuth()
@NivelMinimo('USUARIO')
@Controller('comunicacao/canais')
@ApiTags('Comunicação — Canais')
export class CanaisController {
  constructor(private readonly canaisService: CanaisService) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  @Get()
  @ApiSearchOperation({
    summary: 'Lista canais visíveis ao usuário',
    description:
      'Públicos + privados dos quais é membro. Admin vê todos.',
  })
  async listar(@Request() req: AccessTokenRequest) {
    const isAdmin = req.user.role === 'ADMIN';
    return this.canaisService.listarCanais(req.user.sub, isAdmin);
  }

  @Get(':id')
  @ApiSearchOperation({
    summary: 'Busca um canal pelo ID',
    description: 'Retorna os dados de um canal específico.',
  })
  async buscar(@Param('id') id: string) {
    return this.canaisService.buscarCanal(id);
  }

  // ─── Notificação (USUARIO) ───────────────────────────────────────────
  // Canais públicos não exigem mais inscrição prévia — o usuário só
  // gerencia se quer receber notificação (e, no cliente, se fixa como
  // atalho). Acesso a canal privado continua sendo gerido pelo admin
  // em /membros.

  @Put(':id/notificacao')
  @ApiUpdateOperation({
    summary: 'Configurar notificação de canal',
    description: 'Ativa/desativa notificações do canal para o usuário.',
  })
  async notificacao(
    @Param('id') id: string,
    @Body() body: { ativo: boolean },
    @Request() req: AccessTokenRequest,
  ) {
    return this.canaisService.configurarNotificacao(
      id,
      req.user.sub,
      body.ativo,
    );
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  @Post()
  @NivelMinimo('ADMIN')
  @ApiCreateOperation({
    summary: 'Criar canal',
    description: 'Cria um novo canal de comunicação.',
  })
  async criar(@Body() dados: CriaCanalDto) {
    return this.canaisService.criar(dados);
  }

  @Patch(':id')
  @NivelMinimo('ADMIN')
  @ApiUpdateOperation({
    summary: 'Editar canal',
    description: 'Atualiza dados de um canal existente.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() dados: AtualizaCanalDto,
  ) {
    return this.canaisService.atualizar(id, dados);
  }

  @Delete(':id')
  @NivelMinimo('ADMIN')
  @ApiDeleteOperation({
    summary: 'Excluir canal (soft delete)',
    description: 'Marca o canal como deletado sem remover do banco.',
  })
  async deletar(@Param('id') id: string) {
    return this.canaisService.deletar(id);
  }

  // ─── Membros (ADMIN) ───────────────────────────────────────────────

  @Get(':id/membros')
  @NivelMinimo('ADMIN')
  @ApiSearchOperation({
    summary: 'Listar membros do canal',
    description: 'Retorna membros com dados do usuário.',
  })
  async listarMembros(
    @Param('id') id: string,
    @Query('pagina') pagina?: number,
    @Query('itensPorPagina') itensPorPagina?: number,
  ) {
    return this.canaisService.listarMembros(
      id,
      Number(pagina) || 1,
      Number(itensPorPagina) || 20,
    );
  }

  @Post(':id/membros')
  @NivelMinimo('ADMIN')
  @ApiCreateOperation({
    summary: 'Adicionar membro a canal',
    description: 'Adiciona um usuário como membro do canal.',
  })
  async adicionarMembro(
    @Param('id') id: string,
    @Body() body: AdicionaMembroDto,
  ) {
    return this.canaisService.adicionarMembro(id, body.usuarioId);
  }

  @Delete(':id/membros/:usuarioId')
  @NivelMinimo('ADMIN')
  @ApiDeleteOperation({
    summary: 'Remover membro do canal',
    description: 'Remove um usuário do canal.',
  })
  async removerMembro(
    @Param('id') id: string,
    @Param('usuarioId') usuarioId: string,
  ) {
    return this.canaisService.removerMembro(id, usuarioId);
  }
}
