import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const SENHA_HASH = '$2a$10$h9Nns51p.DuHiprLyGQSn.BPWh.rq2FO4Ksi1svmauZw0e485l2vi'; // 123456
const REACOES = ['curtir', 'amei', 'parabens', 'apoio', 'genial'];
const PDF_DEMO = 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

function imagemDemo(seed: string) {
  return `https://picsum.photos/seed/${seed}/900/500`;
}

function diasAtras(dias: number) {
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000);
}

function amostra<T>(lista: T[], min: number, max: number): T[] {
  const embaralhada = [...lista].sort(() => Math.random() - 0.5);
  const qtd = Math.min(lista.length, min + Math.floor(Math.random() * (max - min + 1)));
  return embaralhada.slice(0, qtd);
}

function escolhe<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
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
    console.log('Criando/atualizando logins principais (admin / usuario)...');
    const admin = await prisma.usuario.upsert({
      where: { login: 'admin' },
      update: { senha: SENHA_HASH, situacao: 'ATIVO' },
      create: {
        nome: 'Administrador',
        email: 'admin@mail.com',
        nivel: 'ADMIN',
        situacao: 'ATIVO',
        login: 'admin',
        senha: SENHA_HASH,
        onboardingConcluido: true,
      },
    });

    const usuarioDemo = await prisma.usuario.upsert({
      where: { login: 'usuario' },
      update: { senha: SENHA_HASH, situacao: 'ATIVO', onboardingConcluido: false },
      create: {
        nome: 'Usuário Comum',
        email: 'usuario@mail.com',
        nivel: 'USUARIO',
        situacao: 'ATIVO',
        login: 'usuario',
        senha: SENHA_HASH,
        onboardingConcluido: false,
      },
    });

    // ─── Limpeza dos dados de demonstração/teste anteriores ──────────────
    // Graças às FKs em cascata (usuarios -> canal_membros/leituras/reações/
    // respostas, canais -> publicações -> mídias/pesquisas/leituras/reações,
    // servicos -> feedbacks), apagar nessa ordem já limpa quase toda a árvore.
    console.log('Limpando dados de demonstração/teste anteriores...');
    await prisma.usuario.deleteMany({ where: { login: { notIn: ['admin', 'usuario'] } } });
    await prisma.canal.deleteMany({});
    await prisma.secretaria.deleteMany({});
    await prisma.servico.deleteMany({});
    await prisma.documento.deleteMany({});
    await prisma.beneficio.deleteMany({});

    // ─── Secretarias (cada uma cria seu canal automaticamente) ───────────
    console.log('Criando secretarias e seus canais...');
    const secretariasDados = [
      { nome: 'Educação', descricao: 'Gestão da rede municipal de ensino', cor: '#2E7D32', icone: 'school' },
      { nome: 'Saúde', descricao: 'Gestão da rede municipal de saúde', cor: '#C62828', icone: 'local_hospital' },
      { nome: 'Obras e Infraestrutura', descricao: 'Obras públicas e infraestrutura urbana', cor: '#EF6C00', icone: 'construction' },
      { nome: 'Administração e Finanças', descricao: 'Gestão administrativa, orçamentária e tributária', cor: '#045DA5', icone: 'account_balance' },
      { nome: 'Assistência Social', descricao: 'Programas sociais e proteção à população', cor: '#6A1B9A', icone: 'diversity_3' },
      { nome: 'Meio Ambiente', descricao: 'Sustentabilidade, parques e áreas verdes', cor: '#00796B', icone: 'park' },
    ];

    const secretarias = [];
    for (const s of secretariasDados) {
      const secretaria = await prisma.secretaria.create({
        data: {
          nome: s.nome,
          descricao: s.descricao,
          canal: {
            create: {
              nome: s.nome,
              descricao: s.descricao,
              tipo: 'PUBLICO',
              oficial: false,
              cor: s.cor,
              icone: s.icone,
            },
          },
        },
        include: { canal: true },
      });
      secretarias.push(secretaria);
    }

    console.log('Criando canal geral de Comunicados...');
    const canalGeral = await prisma.canal.create({
      data: {
        nome: 'Comunicados Gerais',
        descricao: 'Avisos e comunicados oficiais da prefeitura para todos os servidores',
        tipo: 'PUBLICO',
        oficial: true,
        cor: '#045DA5',
        icone: 'campaign',
      },
    });

    // ─── Usuários de demonstração ─────────────────────────────────────
    console.log('Criando usuários de demonstração...');
    const usuariosDados = [
      { nome: 'Ana Souza', login: 'ana.souza', email: 'ana.souza@conquista.gov.br', secretaria: 'Educação', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Carlos Pereira', login: 'carlos.pereira', email: 'carlos.pereira@conquista.gov.br', secretaria: 'Saúde', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Beatriz Lima', login: 'beatriz.lima', email: 'beatriz.lima@conquista.gov.br', secretaria: 'Obras e Infraestrutura', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'João Santos', login: 'joao.santos', email: 'joao.santos@conquista.gov.br', secretaria: 'Administração e Finanças', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Mariana Costa', login: 'mariana.costa', email: 'mariana.costa@conquista.gov.br', secretaria: 'Assistência Social', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Rafael Oliveira', login: 'rafael.oliveira', email: 'rafael.oliveira@conquista.gov.br', secretaria: 'Meio Ambiente', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Fernanda Almeida', login: 'fernanda.almeida', email: 'fernanda.almeida@conquista.gov.br', secretaria: 'Educação', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Lucas Ferreira', login: 'lucas.ferreira', email: 'lucas.ferreira@conquista.gov.br', secretaria: 'Saúde', nivel: 'USUARIO', situacao: 'ATIVO' },
      { nome: 'Patrícia Rocha', login: 'patricia.rocha', email: 'patricia.rocha@conquista.gov.br', secretaria: null, nivel: 'USUARIO', situacao: 'BLOQUEADO' },
      { nome: 'Gabriel Martins', login: 'gabriel.martins', email: 'gabriel.martins@conquista.gov.br', secretaria: null, nivel: 'ADMIN', situacao: 'ATIVO' },
    ];

    const usuariosDemo = [];
    for (const u of usuariosDados) {
      const secretaria = secretarias.find((s) => s.nome === u.secretaria);
      const usuario = await prisma.usuario.create({
        data: {
          nome: u.nome,
          email: u.email,
          login: u.login,
          senha: SENHA_HASH,
          nivel: u.nivel,
          situacao: u.situacao,
          onboardingConcluido: true,
          secretariaId: secretaria?.id,
        },
      });
      usuariosDemo.push({ ...usuario, secretariaNome: u.secretaria });
    }

    // Todos os usuários "cidadão" (comuns e ativos) — usados para engajamento
    // realista em publicações, reações e pesquisas.
    const cidadaos = [usuarioDemo, ...usuariosDemo.filter((u) => u.nivel === 'USUARIO' && u.situacao === 'ATIVO')];

    console.log('Associando usuários aos canais (secretaria + geral)...');
    for (const u of usuariosDemo) {
      await prisma.canalMembro.create({
        data: { canalId: canalGeral.id, usuarioId: u.id, notificacoesAtivas: Math.random() > 0.2 },
      });
      const secretaria = secretarias.find((s) => s.nome === u.secretariaNome);
      if (secretaria?.canal) {
        await prisma.canalMembro.create({
          data: { canalId: secretaria.canal.id, usuarioId: u.id, notificacoesAtivas: Math.random() > 0.3 },
        });
      }
    }
    await prisma.canalMembro.create({ data: { canalId: canalGeral.id, usuarioId: usuarioDemo.id } });

    // ─── Serviços ─────────────────────────────────────────────────────
    console.log('Criando serviços...');
    const servicosDados = [
      { nome: 'Emissão de Alvará de Funcionamento', descricao: 'Solicite ou renove o alvará do seu estabelecimento', icone: 'store', categoria: 'Financeiro', urlAcao: 'https://www.gov.br/pt-br', labelAcao: 'Solicitar', acessoRapido: true },
      { nome: 'Iluminação Pública', descricao: 'Solicitação de reparo na iluminação', icone: 'lightbulb', categoria: 'Infraestrutura', urlAcao: 'https://www.gov.br/pt-br', labelAcao: 'Reportar' },
      { nome: 'Coleta de Lixo', descricao: 'Reclamação ou sugestão sobre coleta', icone: 'delete_outline', categoria: 'Meio Ambiente', urlAcao: 'https://www.gov.br/pt-br' },
      { nome: 'Atendimento Posto de Saúde', descricao: 'Avaliação de atendimento médico municipal', icone: 'local_hospital', categoria: 'Saúde', acessoRapido: true },
      { nome: 'Matrícula Escolar', descricao: 'Serviço de matrícula na rede municipal', icone: 'school', categoria: 'Educação', acessoRapido: true, urlAcao: '/servicos' },
      { nome: 'Poda de Árvores', descricao: 'Solicitação de poda ou remoção de árvores', icone: 'park', categoria: 'Meio Ambiente' },
      { nome: 'Segunda Via de IPTU', descricao: 'Emita a segunda via do carnê de IPTU', icone: 'receipt_long', categoria: 'Financeiro', acessoRapido: true, urlAcao: '/documentos', labelAcao: 'Ver documentos' },
      { nome: 'Transporte Escolar', descricao: 'Cadastro e acompanhamento do transporte escolar', icone: 'directions_bus', categoria: 'Educação' },
      { nome: 'Cadastro no CadÚnico', descricao: 'Atualize seu cadastro para programas sociais', icone: 'diversity_3', categoria: 'Assistência Social', urlAcao: '/beneficios', labelAcao: 'Ver benefícios' },
      { nome: 'Vistoria de Obras', descricao: 'Solicite vistoria técnica para construções', icone: 'construction', categoria: 'Infraestrutura' },
      { nome: 'Agendamento de Vacinação', descricao: 'Agende sua vacina em uma UBS municipal', icone: 'vaccines', categoria: 'Saúde' },
      { nome: 'Ouvidoria Municipal', descricao: 'Canal para dúvidas, elogios e reclamações (em revisão)', icone: 'support_agent', categoria: 'Geral', ativo: false },
    ];

    const servicos = [];
    for (const s of servicosDados) {
      const servico = await prisma.servico.create({
        data: {
          nome: s.nome,
          descricao: s.descricao,
          icone: s.icone,
          categoria: s.categoria,
          urlAcao: s.urlAcao,
          labelAcao: s.labelAcao,
          acessoRapido: s.acessoRapido ?? false,
          ativo: s.ativo ?? true,
        },
      });
      servicos.push(servico);
    }

    // ─── Documentos ───────────────────────────────────────────────────
    console.log('Criando documentos...');
    const documentosDados = [
      { titulo: 'ED-F-005 Folha de Ponto', descricao: 'Documento oficial para registro e controle de frequência mensal do servidor.', categoria: 'Administrativo', corTag: '#E2007A', versao: 'v1.0' },
      { titulo: 'ED-F-006 Alteração de Carga Horária', descricao: 'Formulário para solicitação de ajuste de carga horária e período de trabalho.', categoria: 'Administrativo', corTag: '#E2007A', versao: 'v2.0' },
      { titulo: 'ED-F-007 Requerimento Gratificação PASEP', descricao: 'Requerimento para solicitação de gratificação do Programa PASEP.', categoria: 'Gratificações', corTag: '#7C3AED', versao: 'v1.0' },
      { titulo: 'ED-F-008 Requerimento Gratificação NASF', descricao: 'Requerimento para concessão de gratificação de titulares do NASF.', categoria: 'Gratificações', corTag: '#7C3AED', versao: 'v1.1' },
      { titulo: 'Edital de Matrícula 2027', descricao: 'Regras e cronograma de matrículas para a rede municipal de ensino.', categoria: 'Educação', corTag: '#2E7D32', versao: 'v1.0' },
      { titulo: 'Calendário Escolar 2026', descricao: 'Calendário letivo oficial das escolas da rede municipal.', categoria: 'Educação', corTag: '#2E7D32', versao: 'v1.0' },
      { titulo: 'Guia de Recolhimento de IPTU', descricao: 'Guia para pagamento e parcelamento do Imposto Predial e Territorial Urbano.', categoria: 'Tributário', corTag: '#045DA5', versao: 'v1.0' },
      { titulo: 'Certidão Negativa de Débitos', descricao: 'Modelo de solicitação de certidão negativa de débitos municipais.', categoria: 'Tributário', corTag: '#045DA5', versao: 'v1.0' },
      { titulo: 'Protocolo de Atendimento SUS Municipal', descricao: 'Protocolo padrão de atendimento das unidades básicas de saúde.', categoria: 'Saúde', corTag: '#C62828', versao: 'v3.0' },
      { titulo: 'Manual do Servidor Público', descricao: 'Guia com direitos, deveres e benefícios do servidor municipal.', categoria: 'Recursos Humanos', corTag: '#E17100', versao: 'v1.0' },
      { titulo: 'Tabela de Vencimentos 2026', descricao: 'Tabela salarial vigente para os cargos do quadro efetivo.', categoria: 'Recursos Humanos', corTag: '#E17100', versao: 'v1.0' },
      { titulo: 'Regimento Interno da Prefeitura', descricao: 'Minuta do regimento interno em revisão pela Administração.', categoria: 'Administrativo', corTag: '#E2007A', versao: 'v0.9', ativo: false },
    ];

    for (const [i, d] of documentosDados.entries()) {
      await prisma.documento.create({
        data: {
          titulo: d.titulo,
          versao: d.versao,
          descricao: d.descricao,
          categoria: d.categoria,
          corTag: d.corTag,
          url: PDF_DEMO,
          tipo: 'PDF',
          tamanho: 180_000 + Math.floor(Math.random() * 900_000),
          ativo: d.ativo ?? true,
          createdAt: diasAtras(documentosDados.length - i + Math.floor(Math.random() * 3)),
        },
      });
    }

    // ─── Benefícios ───────────────────────────────────────────────────
    console.log('Criando benefícios...');
    const beneficiosDados = [
      {
        titulo: 'Plano de Saúde do Servidor',
        descricao: 'Cobertura médica e odontológica para servidores e dependentes.',
        descricaoLonga: 'O Plano de Saúde do Servidor oferece cobertura médica e odontológica completa para o servidor e seus dependentes diretos, com rede credenciada em toda a região metropolitana e coparticipação reduzida para procedimentos de rotina.',
        icone: 'health_and_safety',
        categoria: 'Saúde',
        badge: 'Popular',
        destaque: true,
        procedimentos: ['Preencher formulário de adesão', 'Anexar documentos dos dependentes', 'Aguardar aprovação em até 10 dias úteis'],
        elegibilidade: ['Servidor efetivo ou comissionado ativo', 'Dependentes legais cadastrados'],
        locais: [{ name: 'RH Central', address: 'Av. Principal, 100 - Centro', phone: '(11) 4000-1000', hours: 'Seg a Sex, 8h às 17h' }],
        downloads: [{ nome: 'Formulário de Adesão', tipo: 'PDF', tamanho: 245_000, ordem: 0 }],
      },
      {
        titulo: 'Auxílio Alimentação',
        descricao: 'Cartão alimentação mensal para todos os servidores ativos.',
        descricaoLonga: 'Benefício mensal creditado em cartão próprio, destinado à compra de alimentos em estabelecimentos credenciados em todo o município.',
        icone: 'restaurant',
        categoria: 'Alimentação',
        procedimentos: ['Cadastro automático no primeiro contracheque'],
        elegibilidade: ['Servidor efetivo ou comissionado ativo'],
        downloads: [{ nome: 'Lista de Estabelecimentos Credenciados', tipo: 'PDF', tamanho: 512_000, ordem: 0 }],
      },
      {
        titulo: 'Vale Transporte',
        descricao: 'Auxílio para deslocamento casa-trabalho.',
        descricaoLonga: 'Auxílio mensal para custeio de deslocamento entre residência e local de trabalho, via cartão de transporte municipal ou reembolso.',
        icone: 'directions_bus',
        categoria: 'Transporte',
        procedimentos: ['Solicitar no RH da secretaria de lotação', 'Informar linhas utilizadas'],
        elegibilidade: ['Servidor ativo sem veículo funcional'],
      },
      {
        titulo: 'Auxílio Creche',
        descricao: 'Reembolso de despesas com creche para filhos de até 5 anos.',
        descricaoLonga: 'Reembolso mensal parcial das despesas com creche particular para servidores com filhos de até 5 anos incompletos, mediante comprovação.',
        icone: 'child_care',
        categoria: 'Educação',
        procedimentos: ['Anexar comprovante de matrícula', 'Anexar recibo mensal da creche'],
        elegibilidade: ['Servidor efetivo com filho de até 5 anos', 'Ausência de vaga em creche municipal'],
        downloads: [{ nome: 'Formulário de Solicitação', tipo: 'DOCX', tamanho: 98_000, ordem: 0 }],
      },
      {
        titulo: 'Programa de Apoio Psicológico',
        descricao: 'Atendimento psicológico gratuito para servidores.',
        descricaoLonga: 'Sessões de acompanhamento psicológico gratuitas, presenciais ou online, com sigilo garantido, oferecidas em parceria com a Secretaria de Assistência Social.',
        icone: 'psychology',
        categoria: 'Assistência Social',
        badge: 'Novo',
        procedimentos: ['Agendar pelo telefone ou presencialmente', 'Comparecer às sessões agendadas'],
        elegibilidade: ['Todo servidor ativo'],
        locais: [{ name: 'CRAS Central', address: 'Rua das Palmeiras, 45', phone: '(11) 4000-2020', hours: 'Seg a Sex, 9h às 16h' }],
      },
      {
        titulo: 'Convênio Academia da Cidade',
        descricao: 'Desconto em academias parceiras do município.',
        descricaoLonga: 'Servidores municipais têm desconto de até 50% em academias e centros esportivos conveniados, mediante apresentação da carteira funcional.',
        icone: 'fitness_center',
        categoria: 'Lazer',
        procedimentos: ['Apresentar carteira funcional na academia parceira'],
        elegibilidade: ['Servidor ativo'],
      },
      {
        titulo: 'Auxílio Óculos',
        descricao: 'Reembolso para aquisição de óculos de grau (em avaliação).',
        descricaoLonga: 'Benefício em fase de avaliação orçamentária para reembolso parcial na aquisição de óculos de grau, mediante prescrição médica.',
        icone: 'visibility',
        categoria: 'Saúde',
        ativo: false,
        procedimentos: ['Anexar prescrição médica', 'Anexar nota fiscal'],
        elegibilidade: ['Servidor efetivo ativo'],
      },
    ];

    for (const [i, b] of beneficiosDados.entries()) {
      await prisma.beneficio.create({
        data: {
          titulo: b.titulo,
          descricao: b.descricao,
          descricaoLonga: b.descricaoLonga,
          icone: b.icone,
          categoria: b.categoria,
          badge: b.badge,
          destaque: b.destaque ?? false,
          ativo: b.ativo ?? true,
          procedimentos: b.procedimentos ?? [],
          elegibilidade: b.elegibilidade ?? [],
          locais: b.locais ?? undefined,
          createdAt: diasAtras(beneficiosDados.length - i + Math.floor(Math.random() * 3)),
          downloads: b.downloads
            ? { create: b.downloads.map((dl) => ({ nome: dl.nome, url: PDF_DEMO, tipo: dl.tipo, tamanho: dl.tamanho, ordem: dl.ordem })) }
            : undefined,
        },
      });
    }

    // ─── Publicações (comunicados) ─────────────────────────────────────
    console.log('Criando publicações, mídias e pesquisas de satisfação...');
    type PubSeed = {
      canalId: string;
      titulo: string;
      resumo: string;
      corpo: string;
      autorId: string;
      diasAtras: number;
      prioridade?: number;
      privada?: boolean;
      imagemSeed?: string;
      pesquisa?: { pergunta: string; comentarios: string[] };
    };

    const secEducacao = secretarias.find((s) => s.nome === 'Educação')!;
    const secSaude = secretarias.find((s) => s.nome === 'Saúde')!;
    const secObras = secretarias.find((s) => s.nome === 'Obras e Infraestrutura')!;
    const secAdmin = secretarias.find((s) => s.nome === 'Administração e Finanças')!;
    const secAssistencia = secretarias.find((s) => s.nome === 'Assistência Social')!;
    const secAmbiente = secretarias.find((s) => s.nome === 'Meio Ambiente')!;

    const publicacoesDados: PubSeed[] = [
      {
        canalId: canalGeral.id, titulo: 'Prefeitura lança novo Portal do Servidor', prioridade: 2,
        resumo: 'Novo portal digital centraliza documentos, benefícios e serviços em um só lugar.',
        corpo: '<p>A Prefeitura lança oficialmente o novo <strong>Portal Conquista</strong>, reunindo documentos, benefícios, serviços e comunicação interna em uma única plataforma digital, disponível para todos os servidores.</p>',
        autorId: admin.id, diasAtras: 45, imagemSeed: 'portal-conquista',
        pesquisa: { pergunta: 'O que você achou do novo Portal do Servidor?', comentarios: ['Muito mais fácil de encontrar documentos!', 'Interface bem intuitiva.', 'Ainda travando um pouco no celular.', 'Adorei a área de benefícios.'] },
      },
      { canalId: canalGeral.id, titulo: 'Cronograma de pagamento do funcionalismo - 2026', prioridade: 1,
        resumo: 'Confira as datas de pagamento dos servidores municipais para todo o ano.',
        corpo: '<p>Segue o cronograma oficial de pagamento dos servidores efetivos e comissionados para o exercício de 2026, conforme publicado no Diário Oficial.</p>',
        autorId: admin.id, diasAtras: 38 },
      { canalId: canalGeral.id, titulo: 'Campanha de vacinação municipal começa na próxima semana', prioridade: 1,
        resumo: 'Postos de saúde reforçam atendimento durante a campanha de vacinação.',
        corpo: '<p>A partir da próxima segunda-feira, todas as UBS do município terão horário estendido para atendimento da campanha de vacinação municipal.</p>',
        autorId: admin.id, diasAtras: 30 },
      { canalId: canalGeral.id, titulo: 'Feriado municipal: confira o calendário do segundo semestre', prioridade: 0,
        resumo: 'Lista completa de feriados e pontos facultativos até dezembro.',
        corpo: '<p>A Prefeitura divulga o calendário oficial de feriados municipais e pontos facultativos válido até o final do ano.</p>',
        autorId: admin.id, diasAtras: 22 },
      { canalId: canalGeral.id, titulo: 'Resultado do concurso público 2026 divulgado', prioridade: 1,
        resumo: 'Lista de aprovados já está disponível no Diário Oficial.',
        corpo: '<p>O resultado final do concurso público municipal 2026 foi homologado e já pode ser consultado no Diário Oficial do Município.</p>',
        autorId: admin.id, diasAtras: 12 },
      { canalId: canalGeral.id, titulo: 'Manutenção programada no sistema neste fim de semana', prioridade: 0,
        resumo: 'Portal ficará indisponível por cerca de 2 horas para atualização.',
        corpo: '<p>Informamos que o Portal do Servidor passará por manutenção programada neste sábado, das 22h às 00h, podendo ficar temporariamente indisponível.</p>',
        autorId: admin.id, diasAtras: 4,
        pesquisa: { pergunta: 'A manutenção afetou seu uso do sistema?', comentarios: ['Não percebi nenhuma indisponibilidade.', 'Ficou fora do ar por uns 20 minutos pra mim.', 'Tudo certo, sistema voltou rápido.'] },
      },

      { canalId: secEducacao.canal!.id, titulo: 'Matrículas para o ano letivo 2027 já estão abertas', prioridade: 1,
        resumo: 'Pais e responsáveis já podem realizar a pré-matrícula online.',
        corpo: '<p>As matrículas para a rede municipal de ensino referentes ao ano letivo de 2027 já estão abertas. A pré-matrícula pode ser feita pelo portal ou presencialmente nas escolas.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'ana.souza')!.id, diasAtras: 20 },
      { canalId: secEducacao.canal!.id, titulo: 'Escolas municipais recebem novos laboratórios de informática', prioridade: 0,
        resumo: 'Investimento contempla 12 unidades escolares em 2026.',
        corpo: '<p>Doze escolas da rede municipal receberão novos laboratórios de informática equipados, como parte do programa de modernização do ensino.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'fernanda.almeida')!.id, diasAtras: 9, imagemSeed: 'lab-informatica' },

      { canalId: secSaude.canal!.id, titulo: 'Nova UBS inaugurada no bairro Centro', prioridade: 1,
        resumo: 'Unidade amplia atendimento para mais de 8 mil famílias.',
        corpo: '<p>Foi inaugurada nesta semana a nova Unidade Básica de Saúde do bairro Centro, ampliando a capacidade de atendimento da região.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'carlos.pereira')!.id, diasAtras: 27 },
      { canalId: secSaude.canal!.id, titulo: 'Campanha Outubro Rosa: agende seu exame', prioridade: 1,
        resumo: 'Unidades de saúde oferecem exames preventivos gratuitos.',
        corpo: '<p>Durante todo o mês, as unidades de saúde municipais oferecem exames preventivos gratuitos como parte da campanha Outubro Rosa.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'lucas.ferreira')!.id, diasAtras: 15,
        pesquisa: { pergunta: 'Você já agendou seu exame preventivo?', comentarios: ['Já agendei, atendimento excelente!', 'Ainda vou marcar essa semana.', 'Fila estava grande, mas valeu a pena.'] },
      },

      { canalId: secObras.canal!.id, titulo: 'Início das obras de pavimentação na Rua das Flores', prioridade: 0,
        resumo: 'Obras devem durar cerca de 45 dias.',
        corpo: '<p>Começam nesta semana as obras de pavimentação asfáltica na Rua das Flores, com previsão de conclusão em 45 dias.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'beatriz.lima')!.id, diasAtras: 18 },
      { canalId: secObras.canal!.id, titulo: 'Ponte do bairro Industrial é reformada', prioridade: 0,
        resumo: 'Reforma estrutural melhora segurança para pedestres e veículos.',
        corpo: '<p>A ponte de acesso ao bairro Industrial passou por reforma estrutural completa, com reforço da estrutura e nova sinalização.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'beatriz.lima')!.id, diasAtras: 6, imagemSeed: 'ponte-reforma' },

      { canalId: secAdmin.canal!.id, titulo: 'Prazo para declaração de IPTU 2026 é prorrogado', prioridade: 1,
        resumo: 'Novo prazo final é dia 30 do próximo mês.',
        corpo: '<p>A Secretaria de Administração e Finanças prorroga o prazo para declaração e parcelamento do IPTU 2026 até o final do próximo mês.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'joao.santos')!.id, diasAtras: 25 },
      { canalId: secAdmin.canal!.id, titulo: 'Convocação: reunião de alinhamento orçamentário', prioridade: 0, privada: true,
        resumo: 'Reunião interna com equipe da secretaria — presença obrigatória.',
        corpo: '<p>Convocamos toda a equipe da Secretaria de Administração e Finanças para reunião de alinhamento orçamentário na próxima quinta-feira, às 14h.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'joao.santos')!.id, diasAtras: 3 },

      { canalId: secAssistencia.canal!.id, titulo: 'CadÚnico: mutirão de atualização cadastral', prioridade: 0,
        resumo: 'Ação itinerante passa por 5 bairros ao longo do mês.',
        corpo: '<p>A Secretaria de Assistência Social promove mutirão itinerante de atualização do Cadastro Único em cinco bairros da cidade.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'mariana.costa')!.id, diasAtras: 33 },
      { canalId: secAssistencia.canal!.id, titulo: 'Programa Bolsa Família Municipal abre novas vagas', prioridade: 1,
        resumo: 'Complemento municipal ao benefício federal tem 200 novas vagas.',
        corpo: '<p>O programa municipal complementar ao Bolsa Família abre 200 novas vagas para famílias em situação de vulnerabilidade social.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'mariana.costa')!.id, diasAtras: 10,
        pesquisa: { pergunta: 'A informação sobre o programa ficou clara?', comentarios: ['Ficou bem explicado, obrigada!', 'Gostaria de mais detalhes sobre os critérios.', 'Muito útil essa comunicação.'] },
      },

      { canalId: secAmbiente.canal!.id, titulo: 'Mutirão de plantio de árvores neste sábado', prioridade: 0,
        resumo: 'Ação acontece no Parque Municipal, a partir das 8h.',
        corpo: '<p>A Secretaria de Meio Ambiente convida a população para o mutirão de plantio de árvores nativas neste sábado, no Parque Municipal.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'rafael.oliveira')!.id, diasAtras: 16 },
      { canalId: secAmbiente.canal!.id, titulo: 'Coleta seletiva chega a mais 3 bairros', prioridade: 0,
        resumo: 'Expansão do programa atende mais de 4 mil novos domicílios.',
        corpo: '<p>O programa de coleta seletiva municipal é expandido para mais três bairros, beneficiando diretamente mais de 4 mil domicílios.</p>',
        autorId: usuariosDemo.find((u) => u.login === 'rafael.oliveira')!.id, diasAtras: 2, imagemSeed: 'coleta-seletiva' },
    ];

    for (const p of publicacoesDados) {
      const publicacao = await prisma.publicacao.create({
        data: {
          canalId: p.canalId,
          titulo: p.titulo,
          resumo: p.resumo,
          corpo: p.corpo,
          autorId: p.autorId,
          prioridade: p.prioridade ?? 0,
          privada: p.privada ?? false,
          dataPublicacao: diasAtras(p.diasAtras),
          createdAt: diasAtras(p.diasAtras),
          midias: p.imagemSeed
            ? { create: [{ tipo: 'imagem', url: imagemDemo(p.imagemSeed), ordem: 0 }] }
            : undefined,
          pesquisa: p.pesquisa
            ? { create: { pergunta: p.pesquisa.pergunta, escala: 5, permiteComentario: true } }
            : undefined,
        },
        include: { pesquisa: true },
      });

      // Leituras e reações de um subconjunto realista de "cidadãos".
      const leitores = amostra(cidadaos, 3, cidadaos.length);
      for (const leitor of leitores) {
        await prisma.publicacaoLeitura.create({
          data: { publicacaoId: publicacao.id, usuarioId: leitor.id, lidoEm: diasAtras(Math.max(p.diasAtras - Math.floor(Math.random() * 3), 0)) },
        });
      }

      const reagentes = amostra(leitores, 1, Math.max(1, leitores.length - 1));
      for (const reagente of reagentes) {
        await prisma.publicacaoReacao.create({
          data: { publicacaoId: publicacao.id, usuarioId: reagente.id, tipo: escolhe(REACOES) },
        }).catch(() => {}); // evita conflito caso a amostra repita usuário
      }

      if (p.pesquisa && publicacao.pesquisa) {
        const respondentes = amostra(cidadaos, 3, Math.min(7, cidadaos.length));
        for (const [idx, resp] of respondentes.entries()) {
          const rng = Math.random();
          const nota = rng < 0.1 ? 2 : rng < 0.25 ? 3 : rng < 0.6 ? 4 : 5;
          await prisma.pesquisaResposta.create({
            data: {
              pesquisaId: publicacao.pesquisa.id,
              usuarioId: resp.id,
              nota,
              comentario: p.pesquisa.comentarios[idx % p.pesquisa.comentarios.length],
              createdAt: diasAtras(Math.max(p.diasAtras - 1 - idx, 0)),
            },
          }).catch(() => {});
        }
      }
    }

    // ─── Feedback de serviços (últimos 90 dias) ────────────────────────
    console.log('Gerando feedbacks de serviços de teste...');
    await prisma.feedback.deleteMany({});

    const categoriasNegativas = ['Demora no atendimento', 'Dificuldade de acesso', 'Falta de informação', 'Sistema fora do ar', 'Outros'];
    const categoriasPositivas = ['Atendimento rápido', 'Problema resolvido', 'Fácil de usar', 'Outros'];
    const servicosAtivos = servicos.filter((s) => s.ativo);

    const feedbacksData = [];
    for (let i = 0; i < 180; i++) {
      const servicoId = escolhe(servicosAtivos).id;
      const rng = Math.random();
      let nota = 5;
      if (rng < 0.1) nota = 1;
      else if (rng < 0.25) nota = 2;
      else if (rng < 0.45) nota = 3;
      else if (rng < 0.7) nota = 4;

      const isNegativo = nota <= 3;
      const categoria = escolhe(isNegativo ? categoriasNegativas : categoriasPositivas);
      const dataCriacao = diasAtras(Math.floor(Math.random() * 90));

      feedbacksData.push({
        servicoId,
        nota,
        categoria,
        comentario: `Comentário de teste gerado pelo sistema para nota ${nota}`,
        status: Math.random() > 0.5 ? 'RESOLVIDO' : 'PENDENTE',
        createdAt: dataCriacao,
        updatedAt: dataCriacao,
      });
    }

    await prisma.feedback.createMany({ data: feedbacksData });
    console.log('180 feedbacks gerados com sucesso!');

    console.log('\nSeed completo! Resumo:');
    console.log(`- ${secretarias.length} secretarias (+ canais) e 1 canal geral`);
    console.log(`- ${usuariosDados.length} usuários de demonstração (+ admin/usuario)`);
    console.log(`- ${servicosDados.length} serviços`);
    console.log(`- ${documentosDados.length} documentos`);
    console.log(`- ${beneficiosDados.length} benefícios`);
    console.log(`- ${publicacoesDados.length} publicações (com mídias, pesquisas, leituras e reações)`);
    console.log(`- 180 feedbacks de serviços`);
  } catch (e) {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
