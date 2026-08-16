import { Module } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { AiConfigService } from '../config/ai-config.service';

@Module({
  providers: [IngestionService, AiConfigService],
  exports: [IngestionService],
})
export class IngestionModule {}
