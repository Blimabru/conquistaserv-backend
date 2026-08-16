import {
  Controller,
  Get,
  Post,
  Patch,
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
import { DocumentosService } from './documentos.service';
import { CriaDocumentoDto } from './dto/cria-documento.dto';
import { AtualizaDocumentoDto } from './dto/atualiza-documento.dto';
import { BuscaDocumentosDto } from './dto/busca-documentos.dto';

@ApiBearerAuth()
@NivelMinimo('USUARIO')
@Controller('documentos')
@ApiTags('Documentos')
export class DocumentosController {
  constructor(private readonly documentosService: DocumentosService) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  @Get()
  @ApiSearchOperation({
    summary: 'Lista documentos',
    description: 'Usuário comum vê só ativos; admin vê todos (inclusive inativos).',
  })
  async listar(@Query() queryParams: BuscaDocumentosDto, @Request() req: AccessTokenRequest) {
    const isAdmin = req.user.role === 'ADMIN';
    const { pagina, itensPorPagina, busca } = queryParams;
    return this.documentosService.listar(
      isAdmin,
      pagina || 1,
      itensPorPagina || 10,
      busca || '',
    );
  }

  @Get('recentes')
  @ApiSearchOperation({
    summary: 'Documentos recentes',
    description: 'Retorna os N documentos ativos mais recentes.',
  })
  async recentes(@Query('limite') limite?: string) {
    return this.documentosService.recentes(Number(limite) || 4);
  }

  @Get(':id')
  @ApiSearchOperation({
    summary: 'Busca um documento pelo ID',
  })
  async buscarPorId(@Param('id') id: string) {
    return this.documentosService.buscarPorId(id);
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  @Post()
  @NivelMinimo('ADMIN')
  @ApiCreateOperation({
    summary: 'Criar documento',
  })
  async criar(@Body() dados: CriaDocumentoDto) {
    return this.documentosService.criar(dados);
  }

  @Patch(':id')
  @NivelMinimo('ADMIN')
  @ApiUpdateOperation({
    summary: 'Editar documento',
  })
  async atualizar(@Param('id') id: string, @Body() dados: AtualizaDocumentoDto) {
    return this.documentosService.atualizar(id, dados);
  }

  @Delete(':id')
  @NivelMinimo('ADMIN')
  @ApiDeleteOperation({
    summary: 'Excluir documento (soft delete)',
  })
  async deletar(@Param('id') id: string) {
    return this.documentosService.deletar(id);
  }
}
