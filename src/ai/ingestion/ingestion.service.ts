import { Injectable, Logger } from '@nestjs/common';
import { DirectoryLoader } from '@langchain/classic/document_loaders/fs/directory';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { Document } from '@langchain/core/documents';
import { AiConfigService } from '../config/ai-config.service';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly aiConfig: AiConfigService) {}

  async loadAndSplitDocuments(): Promise<Document[]> {
    const docsPath = this.aiConfig.docsPath;

    this.logger.log(`Carregando documentos de: ${docsPath}`);

    const loader = new DirectoryLoader(
      docsPath,
      {
        '.pdf': (path) => new PDFLoader(path),
        '.md': (path) => new TextLoader(path),
        '.txt': (path) => new TextLoader(path),
      },
      true,
    );

    const docs = await loader.load();

    this.logger.log(`${docs.length} documentos carregados. Iniciando split...`);

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.aiConfig.chunkSize,
      chunkOverlap: this.aiConfig.chunkOverlap,
    });

    const splitDocs = await textSplitter.splitDocuments(docs);

    this.logger.log(`Split concluído: ${splitDocs.length} chunks gerados.`);

    return splitDocs;
  }
}
