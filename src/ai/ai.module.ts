import { Module } from '@nestjs/common';
import { LlmModule } from './llm/llm.module';
import { EmbeddingsModule } from './embeddings/embeddings.module';
import { VectorStoreModule } from './vector-store/vector-store.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { MemoryModule } from './memory/memory.module';
import { RagModule } from './rag/rag.module';
import { TrainingModule } from './training/training.module';

@Module({
  imports: [
    LlmModule,
    EmbeddingsModule,
    VectorStoreModule,
    IngestionModule,
    MemoryModule,
    RagModule,
    TrainingModule,
  ],
  exports: [RagModule, TrainingModule],
})
export class AiModule {}
