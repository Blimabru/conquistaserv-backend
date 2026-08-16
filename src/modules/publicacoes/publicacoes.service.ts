import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { CriaPublicacaoDto } from './dto/cria-publicacao.dto';
import { AtualizaPublicacaoDto } from './dto/atualiza-publicacao.dto';

@Injectable()
export class PublicacoesService {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Feed (USUARIO) ─────────────────────────────────────────────────

  async listarFeed(
    usuarioId: string,
    pagina = 1,
    itensPorPagina = 10,
    busca = '',
    destaques = false,
    isAdmin = false,
  ) {
    const AND: any[] = [{ deletedAt: null }];

    if (!isAdmin) {
      AND.push(await this.condicaoVisibilidade(usuarioId));
    }

    if (destaques) {
      AND.push({ canal: { oficial: true, deletedAt: null } });
    }

    if (busca) {
      AND.push({
        OR: [
          { titulo: { contains: busca, mode: 'insensitive' } },
          { resumo: { contains: busca, mode: 'insensitive' } },
        ],
      });
    }

    const where: any = { AND };

    const totalItens = await this.prisma.publicacao.count({ where });
    if (totalItens === 0) return { data: [], maxPag: 0 };

    const skip = itensPorPagina * (pagina - 1);

    const publicacoes = await this.prisma.publicacao.findMany({
      where,
      include: {
        canal: {
          select: { id: true, nome: true, cor: true, icone: true, oficial: true },
        },
        midias: { orderBy: { ordem: 'asc' } },
        pesquisa: true,
        reacoes: { select: { tipo: true, usuarioId: true } },
        leituras: {
          where: { usuarioId },
          select: { id: true },
          take: 1,
        },
        autor: { select: { id: true, nome: true } },
      },
      orderBy: [
        { canal: { oficial: 'desc' } },
        { prioridade: 'desc' },
        { dataPublicacao: 'desc' },
      ],
      skip,
      take: itensPorPagina,
    });

    return {
      data: publicacoes.map((p) => this.formatarPublicacao(p, usuarioId)),
      maxPag: Math.ceil(totalItens / itensPorPagina),
    };
  }

  async listarPorCanal(
    canalId: string,
    usuarioId: string,
    pagina = 1,
    itensPorPagina = 10,
    busca = '',
    isAdmin = false,
  ) {
    const canal = await this.verificarAcessoCanal(canalId, usuarioId, isAdmin);

    const where: any = { deletedAt: null, canalId };
    Object.assign(
      where,
      await this.restricaoPrivacidade(canal.secretariaId, usuarioId, isAdmin),
    );

    if (busca) {
      where.OR = [
        { titulo: { contains: busca, mode: 'insensitive' } },
        { resumo: { contains: busca, mode: 'insensitive' } },
      ];
    }

    const totalItens = await this.prisma.publicacao.count({ where });
    if (totalItens === 0) return { data: [], maxPag: 0 };

    const skip = itensPorPagina * (pagina - 1);

    const publicacoes = await this.prisma.publicacao.findMany({
      where,
      include: {
        canal: {
          select: { id: true, nome: true, cor: true, icone: true, oficial: true },
        },
        midias: { orderBy: { ordem: 'asc' } },
        pesquisa: true,
        reacoes: { select: { tipo: true, usuarioId: true } },
        leituras: {
          where: { usuarioId },
          select: { id: true },
          take: 1,
        },
        autor: { select: { id: true, nome: true } },
      },
      orderBy: { dataPublicacao: 'desc' },
      skip,
      take: itensPorPagina,
    });

    return {
      data: publicacoes.map((p) => this.formatarPublicacao(p, usuarioId)),
      maxPag: Math.ceil(totalItens / itensPorPagina),
    };
  }

  async buscarPublicacao(id: string, usuarioId: string, isAdmin = false) {
    const pub = await this.prisma.publicacao.findFirst({
      where: { id, deletedAt: null },
      include: {
        canal: {
          select: {
            id: true,
            nome: true,
            cor: true,
            icone: true,
            oficial: true,
            tipo: true,
            secretariaId: true,
          },
        },
        midias: { orderBy: { ordem: 'asc' } },
        pesquisa: {
          include: {
            respostas: {
              where: { usuarioId },
              select: { id: true },
              take: 1,
            },
          },
        },
        reacoes: { select: { tipo: true, usuarioId: true } },
        leituras: {
          where: { usuarioId },
          select: { id: true },
          take: 1,
        },
        autor: { select: { id: true, nome: true } },
      },
    });

    if (!pub) throw new NotFoundException('Publicação não encontrada');

    if (!isAdmin && pub.canal.tipo === 'PRIVADO') {
      const membro = await this.prisma.canalMembro.findUnique({
        where: { canalId_usuarioId: { canalId: pub.canalId, usuarioId } },
      });
      if (!membro) {
        throw new ForbiddenException('Você não tem acesso a este canal.');
      }
    }

    if (!isAdmin && pub.privada && pub.canal.secretariaId) {
      const usuario = await this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { secretariaId: true },
      });
      if (usuario?.secretariaId !== pub.canal.secretariaId) {
        throw new ForbiddenException('Você não tem acesso a esta publicação.');
      }
    }

    const result: any = this.formatarPublicacao(pub, usuarioId);

    if (pub.autorId === usuarioId || isAdmin) {
      result.analytics = await this.analytics(id);
    }

    return result;
  }

  // ─── Interações (USUARIO) ──────────────────────────────────────────

  async marcarLido(publicacaoId: string, usuarioId: string) {
    await this.prisma.publicacaoLeitura.upsert({
      where: { publicacaoId_usuarioId: { publicacaoId, usuarioId } },
      create: { publicacaoId, usuarioId },
      update: {},
    });
    return { ok: true };
  }

  async reagir(publicacaoId: string, usuarioId: string, tipo: string) {
    await this.prisma.publicacaoReacao.upsert({
      where: { publicacaoId_usuarioId: { publicacaoId, usuarioId } },
      create: { publicacaoId, usuarioId, tipo },
      update: { tipo },
    });
    return this.buscarPublicacao(publicacaoId, usuarioId);
  }

  async removerReacao(publicacaoId: string, usuarioId: string) {
    try {
      await this.prisma.publicacaoReacao.delete({
        where: { publicacaoId_usuarioId: { publicacaoId, usuarioId } },
      });
    } catch {
      // Idempotente
    }
    return this.buscarPublicacao(publicacaoId, usuarioId);
  }

  async listarReacoes(publicacaoId: string) {
    const reacoes = await this.prisma.publicacaoReacao.findMany({
      where: { publicacaoId },
      include: { usuario: { select: { id: true, nome: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return reacoes.map((r) => ({
      usuarioId: r.usuario.id,
      nome: r.usuario.nome,
      tipo: r.tipo,
    }));
  }

  async responderPesquisa(
    publicacaoId: string,
    usuarioId: string,
    nota: number,
    comentario?: string,
  ) {
    const pub = await this.prisma.publicacao.findFirst({
      where: { id: publicacaoId, deletedAt: null },
      include: { pesquisa: true },
    });
    if (!pub?.pesquisa)
      throw new NotFoundException('Publicação sem pesquisa ativa');

    const jaRespondeu = await this.prisma.pesquisaResposta.findUnique({
      where: {
        pesquisaId_usuarioId: {
          pesquisaId: pub.pesquisa.id,
          usuarioId,
        },
      },
    });
    if (jaRespondeu)
      throw new ConflictException('Você já respondeu esta pesquisa');

    await this.prisma.pesquisaResposta.create({
      data: {
        pesquisaId: pub.pesquisa.id,
        usuarioId,
        nota,
        comentario,
      },
    });

    return { ok: true };
  }

  async resumoNaoLidas(usuarioId: string) {
    const publicacoes = await this.prisma.publicacao.findMany({
      where: {
        AND: [
          { deletedAt: null },
          { leituras: { none: { usuarioId } } },
          await this.condicaoVisibilidade(usuarioId),
        ],
      },
      select: { canalId: true },
    });

    const porCanal: Record<string, number> = {};
    publicacoes.forEach((p) => {
      porCanal[p.canalId] = (porCanal[p.canalId] || 0) + 1;
    });

    return { total: publicacoes.length, porCanal };
  }

  // ─── CRUD Admin ─────────────────────────────────────────────────────

  async criar(dados: CriaPublicacaoDto, autorId: string) {
    const { midias, pesquisa, ...pubData } = dados;

    return this.prisma.publicacao.create({
      data: {
        ...pubData,
        autorId,
        midias: midias?.length
          ? { createMany: { data: midias } }
          : undefined,
        pesquisa: pesquisa
          ? { create: pesquisa }
          : undefined,
      },
      include: {
        midias: true,
        pesquisa: true,
        canal: {
          select: { id: true, nome: true, cor: true, icone: true },
        },
      },
    });
  }

  async atualizar(id: string, dados: AtualizaPublicacaoDto) {
    const pub = await this.prisma.publicacao.findFirst({
      where: { id, deletedAt: null },
    });
    if (!pub) throw new NotFoundException('Publicação não encontrada');

    const { midias, pesquisa, ...pubData } = dados;

    // Atualiza campos simples
    await this.prisma.publicacao.update({
      where: { id },
      data: pubData,
    });

    // Recria mídias se enviadas
    if (midias !== undefined) {
      await this.prisma.midia.deleteMany({ where: { publicacaoId: id } });
      if (midias.length) {
        await this.prisma.midia.createMany({
          data: midias.map((m) => ({ ...m, publicacaoId: id })),
        });
      }
    }

    // Recria pesquisa se enviada
    if (pesquisa !== undefined) {
      await this.prisma.pesquisa.deleteMany({
        where: { publicacaoId: id },
      });
      if (pesquisa) {
        await this.prisma.pesquisa.create({
          data: { ...pesquisa, publicacaoId: id },
        });
      }
    }

    return this.prisma.publicacao.findUnique({
      where: { id },
      include: { midias: true, pesquisa: true },
    });
  }

  async deletar(id: string) {
    const pub = await this.prisma.publicacao.findFirst({
      where: { id, deletedAt: null },
    });
    if (!pub) throw new NotFoundException('Publicação não encontrada');

    return this.prisma.publicacao.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Analytics (ADMIN) ─────────────────────────────────────────────

  async analytics(publicacaoId: string) {
    const pub = await this.prisma.publicacao.findFirst({
      where: { id: publicacaoId, deletedAt: null },
    });
    if (!pub) throw new NotFoundException('Publicação não encontrada');

    const [totalLeituras, reacoesPorTipo, pesquisa] = await Promise.all([
      this.prisma.publicacaoLeitura.count({ where: { publicacaoId } }),
      this.prisma.publicacaoReacao.groupBy({
        by: ['tipo'],
        where: { publicacaoId },
        _count: true,
      }),
      this.prisma.pesquisa.findUnique({
        where: { publicacaoId },
        include: {
          respostas: {
            include: { usuario: { select: { nome: true } } },
          },
        },
      }),
    ]);

    const respostasPesquisa = pesquisa?.respostas ?? [];
    const mediaNota = respostasPesquisa.length
      ? respostasPesquisa.reduce((soma, r) => soma + r.nota, 0) /
        respostasPesquisa.length
      : null;

    return {
      totalLeituras,
      reacoes: reacoesPorTipo.reduce(
        (acc, r) => ({ ...acc, [r.tipo]: r._count }),
        {},
      ),
      pesquisa: pesquisa && {
        pergunta: pesquisa.pergunta,
        totalRespostas: respostasPesquisa.length,
        mediaNota,
        respostas: respostasPesquisa.map((r) => ({
          nota: r.nota,
          comentario: r.comentario,
          usuario: r.usuario.nome,
          data: r.createdAt,
        })),
      },
    };
  }

  // ─── Helpers ────────────────────────────────────────────────────────

  private formatarPublicacao(pub: any, usuarioId: string) {
    const reacoesPorTipo: Record<string, number> = {};
    (pub.reacoes || []).forEach((r: { tipo: string }) => {
      reacoesPorTipo[r.tipo] = (reacoesPorTipo[r.tipo] || 0) + 1;
    });
    const minhaReacao =
      (pub.reacoes || []).find(
        (r: { usuarioId: string }) => r.usuarioId === usuarioId,
      )?.tipo ?? null;
    const lido = pub.leituras?.length > 0;
    const jaRespondi = pub.pesquisa?.respostas?.length > 0;

    return {
      id: pub.id,
      canalId: pub.canalId,
      canal: pub.canal,
      titulo: pub.titulo,
      resumo: pub.resumo,
      corpo: pub.corpo,
      midias: pub.midias || [],
      autor: pub.autor?.nome || null,
      autorId: pub.autorId,
      dataPublicacao: pub.dataPublicacao,
      prioridade: pub.prioridade,
      lido,
      reacoesHabilitadas: pub.reacoesHabilitadas,
      privada: pub.privada,
      reacoes: reacoesPorTipo,
      minhaReacao,
      pesquisa: pub.pesquisa
        ? {
            pergunta: pub.pesquisa.pergunta,
            escala: pub.pesquisa.escala,
            permiteComentario: pub.pesquisa.permiteComentario,
            jaRespondi,
          }
        : null,
    };
  }

  // Publicações visíveis a um usuário comum: de qualquer canal público
  // (não exige mais "seguir"), respeitando o privada=true de canal de
  // secretaria (só quem é da mesma secretaria vê) + canais privados dos
  // quais é membro (gerido pelo admin).
  private async condicaoVisibilidade(usuarioId: string) {
    const [canaisPrivadosMembro, usuario] = await Promise.all([
      this.prisma.canalMembro.findMany({
        where: { usuarioId, canal: { tipo: 'PRIVADO' } },
        select: { canalId: true },
      }),
      this.prisma.usuario.findUnique({
        where: { id: usuarioId },
        select: { secretariaId: true },
      }),
    ]);

    const condicaoPrivacidadePost = usuario?.secretariaId
      ? {
          OR: [
            { privada: false },
            { canal: { secretariaId: usuario.secretariaId } },
          ],
        }
      : { privada: false };

    return {
      OR: [
        { AND: [{ canal: { tipo: 'PUBLICO' } }, condicaoPrivacidadePost] },
        { canalId: { in: canaisPrivadosMembro.map((m) => m.canalId) } },
      ],
    };
  }

  // Se o canal é de secretaria e o usuário não é dela, restringe a
  // publicações públicas (privada=false). Canal geral ou admin: sem restrição.
  private async restricaoPrivacidade(
    canalSecretariaId: string | null,
    usuarioId: string,
    isAdmin: boolean,
  ) {
    if (isAdmin || !canalSecretariaId) return {};

    const usuario = await this.prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { secretariaId: true },
    });
    if (usuario?.secretariaId === canalSecretariaId) return {};

    return { privada: false };
  }

  private async verificarAcessoCanal(
    canalId: string,
    usuarioId: string,
    isAdmin: boolean,
  ) {
    const canal = await this.prisma.canal.findFirst({
      where: { id: canalId, deletedAt: null },
      select: { tipo: true, secretariaId: true },
    });
    if (!canal) throw new NotFoundException('Canal não encontrado');

    if (!isAdmin && canal.tipo === 'PRIVADO') {
      const membro = await this.prisma.canalMembro.findUnique({
        where: { canalId_usuarioId: { canalId, usuarioId } },
      });
      if (!membro) {
        throw new ForbiddenException('Você não tem acesso a este canal.');
      }
    }

    return canal;
  }
}
