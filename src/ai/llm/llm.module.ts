import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { AiConfigService } from '../config/ai-config.service';

@Module({
  providers: [LlmService, AiConfigService],
  exports: [LlmService],
})
export class LlmModule {}
