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
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  try {
    await prisma.usuario.create({
      data: {
        nome: 'Admin',
        email: 'admin@mail.com',
        nivel: 'ADMIN',
        situacao: 'ATIVO',
        login: 'admin',
        senha: '$2b$10$3JEcQYwkwgtT1sM0pwQn.eLRfDYZQR1YVP3JGZr.d0VCkog6YQ3oe',
      },
    });
  } catch (e) {
    console.error('Erro durante o seeding:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
