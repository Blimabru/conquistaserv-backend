import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { Module } from '@nestjs/common';

@Module({
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
