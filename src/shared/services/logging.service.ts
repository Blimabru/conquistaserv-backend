import { PrismaService } from 'src/plugins/database/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

export type CreateLogDto = Prisma.RequestLogUncheckedCreateInput;

@Injectable()
export class LoggingService {
  constructor(private readonly prisma: PrismaService) {}

  async createLog(logData: CreateLogDto): Promise<void> {
    try {
      await this.prisma.requestLog.create({
        data: logData,
      });
    } catch (error) {
      console.error('Failed to save request log:', error);
    }
  }
}
