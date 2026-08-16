import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { CriaBeneficioDto } from './dto/cria-beneficio.dto';
import { AtualizaBeneficioDto } from './dto/atualiza-beneficio.dto';

@Injectable()
export class BeneficiosService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  async listar(isAdmin: boolean) {
    const where: any = { deletedAt: null };
    if (!isAdmin) where.ativo = true;

    return this.prisma.beneficio.findMany({
      where,
      include: { downloads: { orderBy: { ordem: 'asc' } } },
      orderBy: [{ destaque: 'desc' }, { titulo: 'asc' }],
    });
  }

  async buscarPorId(id: string) {
    const beneficio = await this.prisma.beneficio.findFirst({
      where: { id, deletedAt: null },
      include: { downloads: { orderBy: { ordem: 'asc' } } },
    });
    if (!beneficio) throw new NotFoundException('Benefício não encontrado');
    return beneficio;
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  async criar(dados: CriaBeneficioDto) {
    const { downloads, ...beneficioData } = dados;

    const criarOperacao = (tx: any = this.prisma) =>
      tx.beneficio.create({
        data: {
          ...beneficioData,
          downloads: downloads?.length ? { createMany: { data: downloads } } : undefined,
        },
        include: { downloads: true },
      });

    if (dados.destaque) {
      // Só pode haver um benefício em destaque por vez — marcar este substitui o anterior.
      return this.prisma.$transaction(async (tx) => {
        await tx.beneficio.updateMany({
          where: { destaque: true, deletedAt: null },
          data: { destaque: false },
        });
        return criarOperacao(tx);
      });
    }

    return criarOperacao();
  }

  async atualizar(id: string, dados: AtualizaBeneficioDto) {
    await this.buscarPorId(id);
    const { downloads, ...beneficioData } = dados;

    if (dados.destaque) {
      await this.prisma.beneficio.updateMany({
        where: { destaque: true, deletedAt: null, id: { not: id } },
        data: { destaque: false },
      });
    }

    await this.prisma.beneficio.update({ where: { id }, data: beneficioData as any });

    if (downloads !== undefined) {
      await this.prisma.beneficioDownload.deleteMany({ where: { beneficioId: id } });
      if (downloads.length) {
        await this.prisma.beneficioDownload.createMany({
          data: downloads.map((d) => ({ ...d, beneficioId: id })),
        });
      }
    }

    return this.buscarPorId(id);
  }

  async deletar(id: string) {
    await this.buscarPorId(id);
    return this.prisma.beneficio.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
