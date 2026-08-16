/**
 * Seed avulso: cria UMA publicação no canal geral, com o admin como autor e
 * uma imagem gravada em uploads/comunicacao (mesmo caminho que o Multer usa
 * em src/modules/publicacoes/upload.controller.ts).
 *
 * Diferente do prisma/seed.ts, este arquivo é ADITIVO — não apaga nada.
 * É idempotente: rodar de novo substitui a publicação criada na rodada
 * anterior (id fixo) e remove o arquivo antigo do disco.
 *
 * Uso:
 *   npm run seed:publicacao                          # imagem servida pelo front (funciona hoje)
 *   npm run seed:publicacao -- --url=https://...      # URL externa qualquer
 *   npm run seed:publicacao -- --upload               # grava em uploads/ (exige o fix do /uploads)
 *   npm run seed:publicacao -- --upload --imagem=./foto.jpg
 *   npm run seed:publicacao -- --titulo="Outro título" --prioridade=0
 */
import * as dotenv from 'dotenv';
dotenv.config();

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import { copyFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { extname, join, isAbsolute, resolve } from 'path';

// Id fixo para a publicação deste seed, garantindo idempotência.
const PUBLICACAO_ID = '00000000-0000-4000-a000-0000000000f1';

// Mesma allowlist do upload.controller.ts.
const EXTENSOES_PERMITIDAS = /jpeg|jpg|png|webp|gif|mp4|webm/;

// Imagem versionada junto do seed — evita depender de link externo, que expira.
// Só é usada no modo --upload.
const IMAGEM_PADRAO = join(__dirname, 'assets', 'code4city-brainstormlabs.jpeg');

// Caminho da mesma imagem servida pelo nginx do front (public/images/), que é
// o que funciona hoje. As publicações do seed.ts também usam URL externa
// (picsum), e não o /uploads do backend — por isso elas carregam e o upload não.
const IMAGEM_ESTATICA = '/images/Code4CityBrainstormLabs.jpeg';

const CANAL_GERAL = 'Comunicados Gerais';
const LOGIN_ADMIN = 'admin';

const TITULO = 'BrainstormLabs é a grande vencedora do Hackathon Code4City';

const RESUMO =
  'Equipe conquista o 1º lugar do hackathon promovido pela Prefeitura de ' +
  'Vitória da Conquista, por meio da Secretaria Especial de Transformação Pública.';

const CORPO = `
<p><strong>Vitória da Conquista, BA — 16 de agosto de 2026</strong> — A equipe <strong>BrainstormLabs</strong> foi consagrada como a grande vencedora do <strong>Hackathon Code4City — Programando o Futuro da Cidade</strong>, promovido pela Prefeitura Municipal de Vitória da Conquista, por meio da Secretaria Especial de Transformação Pública (SETP).</p>

<p>O evento reuniu talentos da área de tecnologia em uma jornada de inovação, colaboração e desenvolvimento de soluções voltadas aos desafios reais da administração pública e da população de Vitória da Conquista.</p>

<p>Ao longo do hackathon, a BrainstormLabs se destacou pela capacidade de transformar um problema público em uma solução tecnológica prática, acessível e com potencial de impacto real na cidade. A equipe combinou criatividade, tecnologia e visão de produto para apresentar uma proposta que chamou a atenção dos avaliadores e conquistou o primeiro lugar da competição.</p>

<p>A vitória representa não apenas o reconhecimento do trabalho desenvolvido durante o evento, mas também demonstra o potencial da tecnologia e da inovação como ferramentas para aproximar o poder público dos cidadãos e contribuir para a construção de uma cidade cada vez mais inteligente, eficiente e conectada.</p>

<blockquote><p>“Mais do que vencer um hackathon, queremos mostrar que boas ideias, quando unidas à tecnologia e à vontade de transformar a realidade, podem gerar soluções capazes de fazer a diferença na vida das pessoas.”</p></blockquote>

<p>O <strong>Code4City</strong> reforça a importância da participação de estudantes, profissionais e entusiastas de tecnologia na construção de novas ideias para os desafios enfrentados pelo município. A iniciativa também evidencia o compromisso da Prefeitura de Vitória da Conquista com a inovação e com a transformação digital dos serviços públicos.</p>

<p>Com a conquista, a BrainstormLabs encerra o hackathon como símbolo de criatividade, trabalho em equipe e inovação, levando consigo o reconhecimento de ter desenvolvido uma das soluções de maior destaque desta primeira edição do <strong>Code4City</strong>.</p>

<p><strong>BrainstormLabs: programando ideias, desenvolvendo soluções e ajudando a construir o futuro de Vitória da Conquista.</strong></p>
`.trim();

function arg(nome: string): string | undefined {
  const encontrado = process.argv.slice(2).find((a) => a.startsWith(`--${nome}=`));
  return encontrado?.split('=').slice(1).join('=');
}

/**
 * Monta a URL pública do arquivo. Prioriza PUBLIC_BASE_URL porque
 * APP_HOSTNAME:HTTP_PORT é o endereço de bind interno do container — atrás do
 * proxy ele não é acessível de fora. UPLOADS_PUBLIC_PREFIX acompanha o
 * prefixo passado ao useStaticAssets() em src/main.ts.
 */
function baseUrlPublica(): string {
  const publica = process.env.PUBLIC_BASE_URL;
  if (publica) return publica.replace(/\/$/, '');

  const protocolo = process.env.SSL === 'true' ? 'https' : 'http';
  const hostname = process.env.APP_HOSTNAME ?? 'localhost';
  const porta = process.env.HTTP_PORT ?? '3006';
  return `${protocolo}://${hostname}:${porta}`;
}

/**
 * URL da mídia. Por padrão aponta para o arquivo estático do front, servido
 * pelo nginx via HTTPS — funciona sem depender do /uploads do backend.
 * Com --upload, copia o arquivo para uploads/comunicacao e monta a URL do
 * backend (só carrega depois que o /uploads estiver roteado no proxy).
 */
function resolveMidiaUrl(): string {
  if (arg('url')) return arg('url')!;

  if (!process.argv.includes('--upload')) {
    const base = process.env.PUBLIC_BASE_URL ?? 'https://servconquista.brainstormlabs.online';
    return `${base.replace(/\/$/, '')}${IMAGEM_ESTATICA}`;
  }

  const destino = join(process.cwd(), 'uploads', 'comunicacao');
  mkdirSync(destino, { recursive: true });

  const nomeArquivo = copiaImagem(arg('imagem') ?? IMAGEM_PADRAO, destino);
  console.log(`Arquivo copiado para uploads/comunicacao/${nomeArquivo}`);

  const prefixo = process.env.UPLOADS_PUBLIC_PREFIX ?? '/uploads';
  return `${baseUrlPublica()}${prefixo}/comunicacao/${nomeArquivo}`;
}

/** Copia o arquivo para uploads/ replicando a nomenclatura do Multer (uuid + extensão). */
function copiaImagem(origem: string, destino: string): string {
  const caminhoOrigem = isAbsolute(origem) ? origem : resolve(process.cwd(), origem);

  if (!existsSync(caminhoOrigem)) {
    throw new Error(`Arquivo não encontrado: ${caminhoOrigem}`);
  }

  const extensao = extname(caminhoOrigem).toLowerCase();
  if (!EXTENSOES_PERMITIDAS.test(extensao)) {
    throw new Error(
      `Extensão "${extensao}" não permitida. Aceitas: jpeg, jpg, png, webp, gif, mp4, webm.`,
    );
  }

  const nomeArquivo = `${randomUUID()}${extensao}`;
  copyFileSync(caminhoOrigem, join(destino, nomeArquivo));
  return nomeArquivo;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL não está definida. Verifique o arquivo .env.');
  }

  const pool = new Pool({ connectionString: databaseUrl });
  let schema = 'public';
  try {
    const url = new URL(databaseUrl);
    schema = url.searchParams.get('schema') || 'public';
  } catch (e) {}
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool, { schema }) });

  try {
    // ─── Autor e canal ────────────────────────────────────────────────
    const admin = await prisma.usuario.findUnique({ where: { login: LOGIN_ADMIN } });
    if (!admin) {
      throw new Error(
        `Usuário "${LOGIN_ADMIN}" não encontrado. Rode "npm run seed" antes deste seed.`,
      );
    }

    // findFirst (e não findUnique) porque canais.nome não tem constraint única.
    const canalGeral = await prisma.canal.findFirst({
      where: { nome: CANAL_GERAL, deletedAt: null },
    });
    if (!canalGeral) {
      throw new Error(
        `Canal "${CANAL_GERAL}" não encontrado. Rode "npm run seed" antes deste seed.`,
      );
    }

    console.log(`Autor: ${admin.nome} (${admin.login})`);
    console.log(`Canal: ${canalGeral.nome}`);

    // ─── Limpeza da rodada anterior ───────────────────────────────────
    // As mídias somem junto pela FK em cascata; o arquivo no disco não, então
    // apagamos manualmente para não acumular órfãos a cada re-execução.
    const anterior = await prisma.publicacao.findUnique({
      where: { id: PUBLICACAO_ID },
      include: { midias: true },
    });

    if (anterior) {
      console.log('Publicação anterior deste seed encontrada — substituindo...');
      for (const midia of anterior.midias) {
        // Só remove do disco o que veio do modo --upload; URL estática do front
        // aponta para arquivo versionado, que não deve ser apagado.
        if (!midia.url.includes('/uploads/comunicacao/')) continue;
        const nome = midia.url.split('/').pop();
        if (nome) rmSync(join(process.cwd(), 'uploads', 'comunicacao', nome), { force: true });
      }
      await prisma.publicacao.delete({ where: { id: PUBLICACAO_ID } });
    }

    // ─── Mídia ────────────────────────────────────────────────────────
    const url = resolveMidiaUrl();

    // ─── Publicação ───────────────────────────────────────────────────
    const publicacao = await prisma.publicacao.create({
      data: {
        id: PUBLICACAO_ID,
        canalId: canalGeral.id,
        autorId: admin.id,
        titulo: arg('titulo') ?? TITULO,
        resumo: arg('resumo') ?? RESUMO,
        corpo: CORPO,
        prioridade: Number(arg('prioridade') ?? 2),
        privada: false,
        reacoesHabilitadas: true,
        dataPublicacao: new Date(),
        midias: {
          create: [{ tipo: 'imagem', url, ordem: 0 }],
        },
      },
      include: { midias: true },
    });

    console.log('\nPublicação criada:');
    console.log(`- id:        ${publicacao.id}`);
    console.log(`- título:    ${publicacao.titulo}`);
    console.log(`- mídia url: ${publicacao.midias[0].url}`);
  } catch (e) {
    console.error('Erro durante o seed da publicação:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
