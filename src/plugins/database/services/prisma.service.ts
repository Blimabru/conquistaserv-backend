import { Injectable } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const connectionString = process.env.DATABASE_URL as string;
    let schema = 'public';
    try {
      const url = new URL(connectionString);
      schema = url.searchParams.get('schema') || 'public';
    } catch (e) {
      // fallback
    }
    const adapter = new PrismaPg({ connectionString }, { schema });
    super({ adapter });
  }
}
