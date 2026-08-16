import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { IngestionService } from '../ingestion/ingestion.service';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { IngestResult, TrainingStatus } from '../interfaces/ai.interfaces';

@Injectable()
export class TrainingService implements OnModuleInit {
  private readonly logger = new Logger(TrainingService.name);

  constructor(
    private readonly ingestionService: IngestionService,
    private readonly vectorStoreService: VectorStoreService,
  ) {}

  async onModuleInit() {
    try {
      this.logger.log('Carregando documentos automaticamente...');
      await this.ingest();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(
        `Não foi possível carregar documentos automaticamente: ${errorMessage}`,
      );
      this.logger.warn(
        'O servidor continua rodando. Use POST /ai/training/ingest para tentar novamente.',
      );
    }
  }

  async ingest(): Promise<IngestResult> {
    try {
      this.logger.log('Iniciando processo de treinamento (ingestão)...');

      const documents = await this.ingestionService.loadAndSplitDocuments();

      await this.vectorStoreService.initialize(documents);

      const result: IngestResult = {
        success: true,
        totalDocuments: documents.length,
        totalChunks: documents.length,
        message: `Treinamento concluído com sucesso. ${documents.length} chunks processados.`,
      };

      this.logger.log(result.message);
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error(`Erro durante o treinamento: ${errorMessage}`);
      throw error;
    }
  }

  async reingest(): Promise<IngestResult> {
    this.logger.log('Reiniciando treinamento (reset + ingestão)...');
    this.vectorStoreService.reset();
    return this.ingest();
  }

  getStatus(): TrainingStatus {
    return this.vectorStoreService.getStatus();
  }
}
