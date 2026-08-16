import { Injectable, Logger } from '@nestjs/common';
import { MemoryVectorStore } from '@langchain/classic/vectorstores/memory';
import { Document } from '@langchain/core/documents';
import { EmbeddingsService } from '../embeddings/embeddings.service';
import { TrainingStatus } from '../interfaces/ai.interfaces';

@Injectable()
export class VectorStoreService {
  private readonly logger = new Logger(VectorStoreService.name);
  private vectorStore: MemoryVectorStore | null = null;
  private chunksCount = 0;
  private lastIngestedAt: Date | null = null;

  constructor(private readonly embeddingsService: EmbeddingsService) {}

  async initialize(documents: Document[]): Promise<void> {
    this.logger.log(
      `Inicializando vector store com ${documents.length} chunks...`,
    );

    this.vectorStore = await MemoryVectorStore.fromDocuments(
      documents,
      this.embeddingsService.createEmbeddings(),
    );

    this.chunksCount = documents.length;
    this.lastIngestedAt = new Date();

    this.logger.log(
      `Vector store inicializado com ${this.chunksCount} chunks.`,
    );
  }

  getRetriever() {
    if (!this.vectorStore) {
      throw new Error(
        'Vector store não inicializado. Execute o treinamento primeiro.',
      );
    }

    return this.vectorStore.asRetriever();
  }

  isInitialized(): boolean {
    return this.vectorStore !== null;
  }

  reset(): void {
    this.vectorStore = null;
    this.chunksCount = 0;
    this.lastIngestedAt = null;
    this.logger.log('Vector store resetado.');
  }

  getStatus(): TrainingStatus {
    return {
      initialized: this.isInitialized(),
      totalChunks: this.chunksCount,
      lastIngestedAt: this.lastIngestedAt,
    };
  }
}
