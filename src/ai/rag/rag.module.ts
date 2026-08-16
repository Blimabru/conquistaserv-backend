import { Module } from '@nestjs/common';
import { RagService } from './rag.service';
import { RagController } from './rag.controller';
import { LlmModule } from '../llm/llm.module';
import { VectorStoreModule } from '../vector-store/vector-store.module';
import { MemoryModule } from '../memory/memory.module';
import { AiConfigService } from '../config/ai-config.service';

@Module({
  imports: [LlmModule, VectorStoreModule, MemoryModule],
  controllers: [RagController],
  providers: [RagService, AiConfigService],
  exports: [RagService],
})
export class RagModule {}
