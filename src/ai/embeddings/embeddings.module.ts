import { Module } from '@nestjs/common';
import { EmbeddingsService } from './embeddings.service';
import { AiConfigService } from '../config/ai-config.service';

@Module({
  providers: [EmbeddingsService, AiConfigService],
  exports: [EmbeddingsService],
})
export class EmbeddingsModule {}
