import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
// const prisma = new PrismaClient();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL não está definida. Verifique o arquivo .env.',
    );
  }

  const pool = new Pool({ connectionString: databaseUrl });
  let schema = 'public';
  try {
    const url = new URL(databaseUrl);
    schema = url.searchParams.get('schema') || 'public';
  } catch (e) {}
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool, { schema }) });
  try {
    const hash = '$2a$10$h9Nns51p.DuHiprLyGQSn.BPWh.rq2FO4Ksi1svmauZw0e485l2vi'; // 123456

    await prisma.usuario.upsert({
      where: { login: 'admin' },
      update: { senha: hash },
      create: {
        nome: 'Administrador',
        email: 'admin@mail.com',
        nivel: 'ADMIN',
        situacao: 'ATIVO',
        login: 'admin',
        senha: hash,
      }
    });

    await prisma.usuario.upsert({
      where: { login: 'usuario' },
      update: { senha: hash },
      create: {
        nome: 'Usuário Comum',
        email: 'usuario@mail.com',
        nivel: 'USUARIO',
        situacao: 'ATIVO',
        login: 'usuario',
        senha: hash,
      }
    });

    console.log('Criando Serviços de teste...');
    const servicosPadrao = [
      { id: 'srv-1', nome: 'Emissão de Alvará', descricao: 'Serviço de emissão de alvará de funcionamento' },
      { id: 'srv-2', nome: 'Iluminação Pública', descricao: 'Solicitação de reparo na iluminação' },
      { id: 'srv-3', nome: 'Coleta de Lixo', descricao: 'Reclamação ou sugestão sobre coleta' },
      { id: 'srv-4', nome: 'Atendimento Posto de Saúde', descricao: 'Avaliação de atendimento médico municipal' },
      { id: 'srv-5', nome: 'Matrícula Escolar', descricao: 'Serviço de matrícula na rede municipal' },
    ];

    for (const s of servicosPadrao) {
      await prisma.servico.upsert({
        where: { id: s.id },
        update: { nome: s.nome, descricao: s.descricao },
        create: { id: s.id, nome: s.nome, descricao: s.descricao }
      });
    }

    console.log('Verificando se já existem feedbacks...');
    const totalFeedbacks = await prisma.feedback.count();
    
    if (totalFeedbacks === 0) {
      console.log('Gerando Feedbacks de teste (Últimos 90 dias)...');
      
      const categoriasNegativas = ['Demora no atendimento', 'Dificuldade de acesso', 'Falta de informação', 'Sistema fora do ar', 'Outros'];
      const categoriasPositivas = ['Atendimento rápido', 'Problema resolvido', 'Fácil de usar', 'Outros'];
      
      const feedbacksData = [];
      const agora = new Date();
      
      for (let i = 0; i < 150; i++) {
        const servicoId = servicosPadrao[Math.floor(Math.random() * servicosPadrao.length)].id;
        // Distribuição de notas enviesada para ser realista
        const rng = Math.random();
        let nota = 5;
        if (rng < 0.1) nota = 1;
        else if (rng < 0.25) nota = 2;
        else if (rng < 0.45) nota = 3;
        else if (rng < 0.70) nota = 4;
        
        const isNegativo = nota <= 3;
        const categorias = isNegativo ? categoriasNegativas : categoriasPositivas;
        const categoria = categorias[Math.floor(Math.random() * categorias.length)];
        
        // Data aleatória nos últimos 90 dias
        const diasAtras = Math.floor(Math.random() * 90);
        const dataCriacao = new Date(agora.getTime() - (diasAtras * 24 * 60 * 60 * 1000));
        
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
      
      await prisma.feedback.createMany({
        data: feedbacksData
      });
      console.log('150 Feedbacks gerados com sucesso!');
    }
  } catch (e) {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
