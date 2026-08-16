import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { CriaServicoDto } from './dto/cria-servico.dto';
import { AtualizaServicoDto } from './dto/atualiza-servico.dto';

@Injectable()
export class ServicosService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  async listar(isAdmin: boolean) {
    const where: any = { deletedAt: null };
    if (!isAdmin) where.ativo = true;

    return this.prisma.servico.findMany({
      where,
      orderBy: { nome: 'asc' },
    });
  }

  async acessoRapido() {
    return this.prisma.servico.findMany({
      where: { deletedAt: null, ativo: true, acessoRapido: true },
      orderBy: { nome: 'asc' },
    });
  }

  async buscarPorId(id: string) {
    const servico = await this.prisma.servico.findFirst({
      where: { id, deletedAt: null },
    });
    if (!servico) throw new NotFoundException('Serviço não encontrado');
    return servico;
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  async criar(dados: CriaServicoDto) {
    return this.prisma.servico.create({ data: dados });
  }

  async atualizar(id: string, dados: AtualizaServicoDto) {
    await this.buscarPorId(id);
    return this.prisma.servico.update({ where: { id }, data: dados });
  }

  async deletar(id: string) {
    await this.buscarPorId(id);
    return this.prisma.servico.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
