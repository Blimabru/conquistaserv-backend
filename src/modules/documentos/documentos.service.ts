import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { PaginateService } from 'src/shared/services/paginate.service';
import { CriaDocumentoDto } from './dto/cria-documento.dto';
import { AtualizaDocumentoDto } from './dto/atualiza-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  async listar(
    isAdmin: boolean,
    pagina: number,
    itensPorPagina: number,
    busca: string,
  ) {
    const querys: any = { deletedAt: null };
    if (!isAdmin) querys.ativo = true;

    return this.paginateService.paginate({
      module: 'documento',
      busca,
      pagina,
      itensPorPagina,
      querys,
      buscaPor: 'titulo',
      orderBy: { createdAt: 'desc' },
    });
  }

  async recentes(limite: number) {
    return this.prisma.documento.findMany({
      where: { deletedAt: null, ativo: true },
      orderBy: { createdAt: 'desc' },
      take: limite,
    });
  }

  async buscarPorId(id: string) {
    const documento = await this.prisma.documento.findFirst({
      where: { id, deletedAt: null },
    });
    if (!documento) throw new NotFoundException('Documento não encontrado');
    return documento;
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  async criar(dados: CriaDocumentoDto) {
    return this.prisma.documento.create({ data: dados });
  }

  async atualizar(id: string, dados: AtualizaDocumentoDto) {
    await this.buscarPorId(id);
    return this.prisma.documento.update({ where: { id }, data: dados });
  }

  async deletar(id: string) {
    await this.buscarPorId(id);
    return this.prisma.documento.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
