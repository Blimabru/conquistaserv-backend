import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { PaginateService } from 'src/shared/services/paginate.service';
import { CriaCanalDto } from './dto/cria-canal.dto';
import { AtualizaCanalDto } from './dto/atualiza-canal.dto';

@Injectable()
export class CanaisService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  // ─── Leitura (USUARIO) ──────────────────────────────────────────────

  async listarCanais(usuarioId: string, isAdmin: boolean) {
    const where: any = { deletedAt: null };

    if (!isAdmin) {
      // Usuário comum: públicos + privados dos quais é membro
      where.OR = [
        { tipo: 'PUBLICO' },
        { membros: { some: { usuarioId } } },
      ];
    }

    const canais = await this.prisma.canal.findMany({
      where,
      include: {
        _count: { select: { publicacoes: true, membros: true } },
        membros: {
          where: { usuarioId },
          select: { id: true, notificacoesAtivas: true },
        },
        secretaria: { select: { id: true, nome: true } },
      },
      orderBy: [{ oficial: 'desc' }, { nome: 'asc' }],
    });

    return canais.map((canal) => {
      const membro = canal.membros[0] || null;
      return {
        id: canal.id,
        nome: canal.nome,
        descricao: canal.descricao,
        tipo: canal.tipo,
        oficial: canal.oficial,
        cor: canal.cor,
        icone: canal.icone,
        secretaria: canal.secretaria,
        // Canal público não exige mais "seguir" — todo mundo tem acesso,
        // souMembro aqui só indica se existe registro de preferência de
        // notificação. Privado continua exigindo membro de verdade (admin).
        souMembro: canal.tipo === 'PUBLICO' ? true : !!membro,
        notificacoesAtivas: membro?.notificacoesAtivas ?? (canal.tipo === 'PUBLICO'),
        totalPublicacoes: canal._count.publicacoes,
        totalMembros: canal._count.membros,
      };
    });
  }

  async buscarCanal(id: string) {
    const canal = await this.prisma.canal.findFirst({
      where: { id, deletedAt: null },
      include: { secretaria: { select: { id: true, nome: true } } },
    });
    if (!canal) throw new NotFoundException('Canal não encontrado');
    return canal;
  }

  // ─── Notificação (USUARIO) ───────────────────────────────────────────

  async configurarNotificacao(
    canalId: string,
    usuarioId: string,
    ativo: boolean,
  ) {
    const canal = await this.buscarCanal(canalId);

    if (canal.tipo === 'PRIVADO') {
      const membro = await this.prisma.canalMembro.findUnique({
        where: { canalId_usuarioId: { canalId, usuarioId } },
      });
      if (!membro) {
        throw new ForbiddenException('Você não tem acesso a este canal.');
      }
    }

    // Canal público: cria a preferência na hora, não precisa de inscrição prévia.
    return this.prisma.canalMembro.upsert({
      where: { canalId_usuarioId: { canalId, usuarioId } },
      create: { canalId, usuarioId, notificacoesAtivas: ativo },
      update: { notificacoesAtivas: ativo },
    });
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  async criar(dados: CriaCanalDto) {
    if (dados.oficial) {
      return this.prisma.$transaction(async (tx) => {
        // Só pode haver um canal principal por vez — marcar este substitui o anterior.
        await tx.canal.updateMany({
          where: { oficial: true, deletedAt: null },
          data: { oficial: false },
        });
        return tx.canal.create({ data: dados });
      });
    }

    return this.prisma.canal.create({ data: dados });
  }

  async atualizar(id: string, dados: AtualizaCanalDto) {
    const canal = await this.buscarCanal(id);

    // Canal de secretaria é sempre público e nunca "principal" — isso é
    // controlado pelo fluxo de Secretarias, não editável aqui.
    if (canal.secretariaId) {
      if (dados.tipo && dados.tipo !== 'PUBLICO') {
        throw new BadRequestException(
          'Canal de secretaria é sempre público.',
        );
      }
      if (dados.oficial) {
        throw new BadRequestException(
          'Canal de secretaria não pode ser marcado como principal.',
        );
      }
    }

    if (dados.oficial) {
      return this.prisma.$transaction(async (tx) => {
        // Só pode haver um canal principal por vez — marcar este substitui o anterior.
        await tx.canal.updateMany({
          where: { oficial: true, deletedAt: null, id: { not: id } },
          data: { oficial: false },
        });
        return tx.canal.update({ where: { id }, data: dados });
      });
    }

    return this.prisma.canal.update({ where: { id }, data: dados });
  }

  async deletar(id: string) {
    await this.buscarCanal(id);
    return this.prisma.canal.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Membros (ADMIN) ───────────────────────────────────────────────

  async listarMembros(
    canalId: string,
    pagina: number = 1,
    itensPorPagina: number = 20,
  ) {
    await this.buscarCanal(canalId);

    const skip = itensPorPagina * (pagina - 1);
    const totalItens = await this.prisma.canalMembro.count({
      where: { canalId },
    });

    if (totalItens === 0) return { data: [], maxPag: 0 };

    const membros = await this.prisma.canalMembro.findMany({
      where: { canalId },
      include: {
        usuario: {
          select: { id: true, nome: true, email: true, login: true },
        },
      },
      skip,
      take: itensPorPagina,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: membros,
      maxPag: Math.ceil(totalItens / itensPorPagina),
    };
  }

  async adicionarMembro(canalId: string, usuarioId: string) {
    await this.buscarCanal(canalId);
    return this.prisma.canalMembro.upsert({
      where: { canalId_usuarioId: { canalId, usuarioId } },
      create: { canalId, usuarioId },
      update: {},
    });
  }

  async removerMembro(canalId: string, usuarioId: string) {
    try {
      await this.prisma.canalMembro.delete({
        where: { canalId_usuarioId: { canalId, usuarioId } },
      });
    } catch {
      throw new NotFoundException('Membro não encontrado neste canal');
    }
    return { ok: true };
  }
}
