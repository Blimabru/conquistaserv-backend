import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../plugins/database/services/prisma.service';
import { PaginateService } from 'src/shared/services/paginate.service';
import { CriaSecretariaDto } from './dto/cria-secretaria.dto';
import { AtualizaSecretariaDto } from './dto/atualiza-secretaria.dto';

@Injectable()
export class SecretariasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly paginateService: PaginateService,
  ) {}

  async buscaTodos(pagina: number, itensPorPagina: number, busca: string) {
    return this.paginateService.paginate({
      module: 'secretaria',
      busca,
      pagina,
      itensPorPagina,
      querys: { deletedAt: null },
      include: { canal: true },
      orderBy: { nome: 'asc' },
    });
  }

  async buscaPorId(id: string) {
    const secretaria = await this.prisma.secretaria.findFirst({
      where: { id, deletedAt: null },
      include: { canal: true },
    });
    if (!secretaria) throw new NotFoundException('Secretaria não encontrada');
    return secretaria;
  }

  // Cria a secretaria e o canal dela juntos (1:1) — write aninhado do Prisma
  // já roda como uma única transação, não precisa de $transaction manual.
  async cria(dados: CriaSecretariaDto) {
    const { cor, icone, ...secretariaData } = dados;

    return this.prisma.secretaria.create({
      data: {
        ...secretariaData,
        canal: {
          create: {
            nome: dados.nome,
            descricao: dados.descricao,
            tipo: 'PUBLICO',
            oficial: false,
            cor: cor || '#045DA5',
            icone: icone || 'account_balance',
          },
        },
      },
      include: { canal: true },
    });
  }

  async atualiza(id: string, dados: AtualizaSecretariaDto) {
    await this.buscaPorId(id);
    return this.prisma.secretaria.update({
      where: { id },
      data: dados,
      include: { canal: true },
    });
  }

  async deleta(id: string) {
    const secretaria = await this.buscaPorId(id);

    const operacoes: any[] = [
      this.prisma.secretaria.update({
        where: { id },
        data: { deletedAt: new Date() },
      }),
    ];

    if (secretaria.canal) {
      operacoes.push(
        this.prisma.canal.update({
          where: { id: secretaria.canal.id },
          data: { deletedAt: new Date() },
        }),
      );
    }

    await this.prisma.$transaction(operacoes);
  }
}
