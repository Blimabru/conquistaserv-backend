import { PrismaService } from 'src/plugins/database/services/prisma.service';
import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(query: QueryAnalyticsDto) {
    const { startDate, endDate } = query;

    const where: Prisma.RequestLogWhereInput = {
      timestamp: {
        gte: startDate ? new Date(startDate) : undefined,
        lte: endDate ? new Date(endDate) : undefined,
      },
    };

    const [totalRequests, errorCount, avgLatency, uniqueUsers] =
      await this.prisma.$transaction([
        this.prisma.requestLog.count({ where }),
        this.prisma.requestLog.count({
          where: { ...where, statusCode: { gte: 400 } },
        }),
        this.prisma.requestLog.aggregate({
          _avg: { latency: true },
          where,
        }),
        this.prisma.requestLog.findMany({
          where,
          distinct: ['userId'],
          select: { userId: true },
        }),
      ]);

    const errorRate =
      totalRequests > 0 ? (errorCount / totalRequests) * 100 : 0;

    return {
      totalRequests,
      errorCount,
      errorRate: `${errorRate.toFixed(2)}%`,
      averageLatency: `${avgLatency._avg.latency?.toFixed(2) ?? 0} ms`,
      uniqueUsersCount: uniqueUsers.filter((u) => u.userId !== null).length,
    };
  }

  async getTopEndpoints(query: QueryAnalyticsDto) {
    const { startDate, endDate } = query;

    const logs = await this.prisma.requestLog.findMany({
      where: {
        timestamp: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      select: {
        path: true,
        method: true,
      },
    });

    const counts = new Map<string, number>();
    for (const log of logs) {
      const key = `${log.method} ${log.path}`;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const sortedEndpoints = Array.from(counts.entries())
      .map(([key, count]) => {
        const [method, path] = key.split(' ', 2);
        return { method, path, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return sortedEndpoints;
  }

  async getMostActiveUsers(query: QueryAnalyticsDto) {
    const { startDate, endDate } = query;

    const logs = await this.prisma.requestLog.findMany({
      where: {
        userId: { not: null },
        timestamp: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      select: {
        userId: true,
      },
    });

    const counts = new Map<string, number>();
    for (const log of logs) {
      if (log.userId) {
        counts.set(log.userId, (counts.get(log.userId) || 0) + 1);
      }
    }

    const sortedUsers = Array.from(counts.entries())
      .map(([userId, count]) => ({ userId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return sortedUsers;
  }
}
