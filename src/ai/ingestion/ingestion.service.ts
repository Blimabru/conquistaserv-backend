import { Injectable, Logger } from '@nestjs/common';
import { DirectoryLoader } from '@langchain/classic/document_loaders/fs/directory';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { TextLoader } from '@langchain/classic/document_loaders/fs/text';
import { RecursiveCharacterTextSplitter } from '@langchain/classic/text_splitter';
import { Document } from '@langchain/core/documents';
import { AiConfigService } from '../config/ai-config.service';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(private readonly aiConfig: AiConfigService) {}

  async loadAndSplitDocuments(): Promise<Document[]> {
    const docsPath = this.aiConfig.docsPath;
    const uploadsPath = join(process.cwd(), 'uploads', 'documentos');

    this.logger.log(`Carregando documentos estáticos de: ${docsPath}`);
    let allDocs: Document[] = [];

    const loadersMap = {
      '.pdf': (path) => new PDFLoader(path),
      '.md': (path) => new TextLoader(path),
      '.txt': (path) => new TextLoader(path),
    };

    if (fs.existsSync(docsPath)) {
      const loaderDocs = new DirectoryLoader(docsPath, loadersMap, true);
      const docs1 = await loaderDocs.load();
      allDocs = allDocs.concat(docs1);
    }

    if (fs.existsSync(uploadsPath)) {
      this.logger.log(`Carregando documentos dinâmicos de: ${uploadsPath}`);
      const loaderUploads = new DirectoryLoader(uploadsPath, loadersMap, true);
      const docs2 = await loaderUploads.load();
      allDocs = allDocs.concat(docs2);
    }

    this.logger.log(
      `${allDocs.length} documentos carregados. Iniciando split...`,
    );

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.aiConfig.chunkSize,
      chunkOverlap: this.aiConfig.chunkOverlap,
    });

    const splitDocs = await textSplitter.splitDocuments(allDocs);

    this.logger.log(`Split concluído: ${splitDocs.length} chunks gerados.`);

    return splitDocs;
  }
}
