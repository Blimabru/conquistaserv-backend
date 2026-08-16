import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Put,
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
import { PublicacoesService } from './publicacoes.service';
import { CriaPublicacaoDto } from './dto/cria-publicacao.dto';
import { AtualizaPublicacaoDto } from './dto/atualiza-publicacao.dto';
import { BuscaPublicacoesDto } from './dto/busca-publicacoes.dto';
import { ReagirDto } from './dto/reagir.dto';
import { RespondePesquisaDto } from './dto/responde-pesquisa.dto';

@ApiBearerAuth()
@NivelMinimo('USUARIO')
@Controller('comunicacao')
@ApiTags('Comunicação — Publicações')
export class PublicacoesController {
  constructor(private readonly publicacoesService: PublicacoesService) {}

  // ─── Feed e Leitura (USUARIO) ──────────────────────────────────────

  @Get('publicacoes')
  @ApiSearchOperation({
    summary: 'Feed de publicações',
    description:
      'Publicações dos canais que o usuário segue, ordenadas por relevância. Admin recebe todas as publicações do sistema (usado pela listagem administrativa).',
  })
  async feed(
    @Request() req: AccessTokenRequest,
    @Query() query: BuscaPublicacoesDto,
  ) {
    return this.publicacoesService.listarFeed(
      req.user.sub,
      query.pagina || 1,
      query.itensPorPagina || 10,
      query.busca || '',
      query.destaques === 'true',
      req.user.role === 'ADMIN',
    );
  }

  @Get('canais/:id/publicacoes')
  @ApiSearchOperation({
    summary: 'Publicações de um canal',
    description: 'Lista publicações de um canal específico.',
  })
  async porCanal(
    @Param('id') canalId: string,
    @Request() req: AccessTokenRequest,
    @Query() query: BuscaPublicacoesDto,
  ) {
    return this.publicacoesService.listarPorCanal(
      canalId,
      req.user.sub,
      query.pagina || 1,
      query.itensPorPagina || 10,
      query.busca || '',
      req.user.role === 'ADMIN',
    );
  }

  @Get('publicacoes/:id')
  @ApiSearchOperation({
    summary: 'Detalhe de uma publicação',
    description: 'Retorna publicação completa com mídias, pesquisa e estado do usuário.',
  })
  async detalhe(
    @Param('id') id: string,
    @Request() req: AccessTokenRequest,
  ) {
    return this.publicacoesService.buscarPublicacao(
      id,
      req.user.sub,
      req.user.role === 'ADMIN',
    );
  }

  @Get('nao-lidas')
  @ApiSearchOperation({
    summary: 'Resumo de publicações não lidas',
    description: 'Total geral e por canal de publicações que o usuário ainda não leu.',
  })
  async naoLidas(@Request() req: AccessTokenRequest) {
    return this.publicacoesService.resumoNaoLidas(req.user.sub);
  }

  // ─── Interações (USUARIO) ──────────────────────────────────────────

  @Post('publicacoes/:id/lido')
  @ApiCreateOperation({
    summary: 'Marcar publicação como lida',
    description: 'Idempotente — não duplica se já foi marcada.',
  })
  async marcarLido(
    @Param('id') id: string,
    @Request() req: AccessTokenRequest,
  ) {
    return this.publicacoesService.marcarLido(id, req.user.sub);
  }

  @Put('publicacoes/:id/reacao')
  @ApiUpdateOperation({
    summary: 'Reagir a uma publicação',
    description: 'Upsert — se já reagiu, troca o tipo.',
  })
  async reagir(
    @Param('id') id: string,
    @Body() body: ReagirDto,
    @Request() req: AccessTokenRequest,
  ) {
    return this.publicacoesService.reagir(id, req.user.sub, body.tipo);
  }

  @Delete('publicacoes/:id/reacao')
  @ApiDeleteOperation({
    summary: 'Remover reação',
    description: 'Remove a reação do usuário autenticado.',
  })
  async removerReacao(
    @Param('id') id: string,
    @Request() req: AccessTokenRequest,
  ) {
    return this.publicacoesService.removerReacao(id, req.user.sub);
  }

  @Get('publicacoes/:id/reacoes')
  @ApiSearchOperation({
    summary: 'Listar reações de uma publicação',
    description: 'Lista agrupada com nome de quem reagiu.',
  })
  async listarReacoes(@Param('id') id: string) {
    return this.publicacoesService.listarReacoes(id);
  }

  @Post('publicacoes/:id/pesquisa')
  @ApiCreateOperation({
    summary: 'Responder pesquisa de satisfação',
    description: '409 se o usuário já respondeu.',
  })
  async responderPesquisa(
    @Param('id') id: string,
    @Body() body: RespondePesquisaDto,
    @Request() req: AccessTokenRequest,
  ) {
    return this.publicacoesService.responderPesquisa(
      id,
      req.user.sub,
      body.nota,
      body.comentario,
    );
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  @Post('publicacoes')
  @NivelMinimo('ADMIN')
  @ApiCreateOperation({
    summary: 'Criar publicação',
    description: 'Cria publicação com mídias e pesquisa opcional.',
  })
  async criar(
    @Body() dados: CriaPublicacaoDto,
    @Request() req: AccessTokenRequest,
  ) {
    return this.publicacoesService.criar(dados, req.user.sub);
  }

  @Patch('publicacoes/:id')
  @NivelMinimo('ADMIN')
  @ApiUpdateOperation({
    summary: 'Editar publicação',
    description: 'Atualiza campos, mídias e pesquisa.',
  })
  async atualizar(
    @Param('id') id: string,
    @Body() dados: AtualizaPublicacaoDto,
  ) {
    return this.publicacoesService.atualizar(id, dados);
  }

  @Delete('publicacoes/:id')
  @NivelMinimo('ADMIN')
  @ApiDeleteOperation({
    summary: 'Excluir publicação (soft delete)',
    description: 'Marca como deletada sem remover do banco.',
  })
  async deletar(@Param('id') id: string) {
    return this.publicacoesService.deletar(id);
  }

  @Get('publicacoes/:id/analytics')
  @NivelMinimo('ADMIN')
  @ApiSearchOperation({
    summary: 'Analytics de uma publicação',
    description: 'Total de leituras, reações por tipo e dados da pesquisa.',
  })
  async analytics(@Param('id') id: string) {
    return this.publicacoesService.analytics(id);
  }
}
