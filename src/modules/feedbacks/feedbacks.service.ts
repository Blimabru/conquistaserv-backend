import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';

@Injectable()
export class FeedbacksService {
  constructor(private prisma: PrismaService) {}

  private getFiltroData(dias: number) {
    if (!dias) return undefined;
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return data;
  }

  async getMetrics(dias?: number) {
    const whereClause: any = {};
    if (dias) {
      whereClause.createdAt = { gte: this.getFiltroData(dias) };
    }

    const feedbacks = await this.prisma.feedback.findMany({
      where: whereClause,
      include: { servico: true }
    });

    if (feedbacks.length === 0) {
      return {
        total: 0,
        media: 0,
        positivasPct: 0,
        negativasPct: 0,
        distribuicao: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        categorias: [],
        servicos: [],
        evolucao: [],
      };
    }

    const total = feedbacks.length;
    const soma = feedbacks.reduce((acc, f) => acc + f.nota, 0);
    const media = parseFloat((soma / total).toFixed(1));

    const positivas = feedbacks.filter(f => f.nota >= 4).length;
    const negativas = feedbacks.filter(f => f.nota <= 3).length; // Considerado 1,2,3 como necessita atenção
    const positivasPct = Math.round((positivas / total) * 100);
    const negativasPct = Math.round((negativas / total) * 100);

    const distribuicao = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => distribuicao[f.nota]++);

    const catMap = new Map();
    feedbacks.forEach(f => {
      if (f.categoria) {
        catMap.set(f.categoria, (catMap.get(f.categoria) || 0) + 1);
      }
    });
    const categorias = Array.from(catMap.entries())
      .map(([nome, count]) => ({ nome, count }))
      .sort((a, b) => b.count - a.count);

    const servMap = new Map();
    feedbacks.forEach(f => {
      if (!servMap.has(f.servicoId)) {
        servMap.set(f.servicoId, { id: f.servicoId, nome: f.servico.nome, total: 0, soma: 0 });
      }
      const s = servMap.get(f.servicoId);
      s.total++;
      s.soma += f.nota;
    });
    const servicos = Array.from(servMap.values()).map(s => ({
      id: s.id,
      nome: s.nome,
      total: s.total,
      media: parseFloat((s.soma / s.total).toFixed(1))
    })).sort((a, b) => b.media - a.media);

    const evoMap = new Map();
    feedbacks.forEach(f => {
      const dataStr = f.createdAt.toISOString().split('T')[0];
      if (!evoMap.has(dataStr)) evoMap.set(dataStr, { data: dataStr, total: 0, soma: 0 });
      const e = evoMap.get(dataStr);
      e.total++;
      e.soma += f.nota;
    });
    const evolucao = Array.from(evoMap.values())
      .map(e => ({ data: e.data, media: parseFloat((e.soma / e.total).toFixed(1)) }))
      .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

    return {
      total,
      media,
      positivasPct,
      negativasPct,
      distribuicao,
      categorias,
      servicos,
      evolucao,
    };
  }

  async getRecentes(dias?: number, limit: number = 10) {
    const whereClause: any = {};
    if (dias) {
      whereClause.createdAt = { gte: this.getFiltroData(dias) };
    }

    return this.prisma.feedback.findMany({
      where: whereClause,
      include: { servico: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}
