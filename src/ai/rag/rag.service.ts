import { Injectable, Logger } from '@nestjs/common';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createRetrievalChain } from '@langchain/classic/chains/retrieval';
import { createStuffDocumentsChain } from '@langchain/classic/chains/combine_documents';
import * as fs from 'fs';
import * as path from 'path';
import { LlmService } from '../llm/llm.service';
import { VectorStoreService } from '../vector-store/vector-store.service';
import { AiConfigService } from '../config/ai-config.service';
import { MemoryService } from '../memory/memory.service';
import { AskQuestionResult } from '../interfaces/ai.interfaces';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private cachedPromptTemplate: string | null = null;

  constructor(
    private readonly llmService: LlmService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly aiConfig: AiConfigService,
    private readonly memoryService: MemoryService,
  ) {}

  private loadPromptTemplate(): string {
    if (this.cachedPromptTemplate) {
      return this.cachedPromptTemplate;
    }

    const promptPath = path.resolve(this.aiConfig.systemPromptPath);

    try {
      this.cachedPromptTemplate = fs.readFileSync(promptPath, 'utf-8');
      this.logger.log(`Prompt carregado de: ${promptPath}`);
    } catch {
      this.logger.warn(
        `Arquivo de prompt não encontrado em ${promptPath}. Usando prompt padrão.`,
      );
      this.cachedPromptTemplate = this.getDefaultPrompt();
    }

    return this.cachedPromptTemplate;
  }

  private getDefaultPrompt(): string {
    return `Você é o ConquistaServ, o assistente virtual do Portal do Servidor.
Responda com base no contexto fornecido. Se não souber, diga que não possui a informação.
{history}
Contexto:
{context}

Pergunta:
{input}

Resposta:`;
  }

  reloadPrompt(): void {
    this.cachedPromptTemplate = null;
    this.loadPromptTemplate();
    this.logger.log('Prompt recarregado com sucesso.');
  }

  async askQuestion(
    question: string,
    sessionId?: string,
  ): Promise<AskQuestionResult> {
    if (!this.vectorStoreService.isInitialized()) {
      throw new Error(
        'Vector store não inicializado. Execute o treinamento primeiro via POST /ai/training/ingest.',
      );
    }

    this.logger.log(
      `Processando pergunta: "${question}"${sessionId ? ` [sessão: ${sessionId}]` : ''}`,
    );

    // Registra a mensagem do usuário no histórico
    if (sessionId) {
      this.memoryService.addUserMessage(sessionId, question);
    }

    const model = this.llmService.createChatModel();

    // Monta o prompt substituindo {history} pelo histórico formatado
    const rawTemplate = this.loadPromptTemplate();
    const history = sessionId
      ? this.memoryService.formatHistoryForPrompt(sessionId)
      : '';
    const templateWithHistory = rawTemplate.replace('{history}', history);

    const prompt = ChatPromptTemplate.fromTemplate(templateWithHistory);

    const documentChain = await createStuffDocumentsChain({
      llm: model,
      prompt,
    });

    const retrievalChain = await createRetrievalChain({
      combineDocsChain: documentChain,
      retriever: this.vectorStoreService.getRetriever(),
    });

    const response = await retrievalChain.invoke({
      input: question,
    });

    // Registra a resposta no histórico
    if (sessionId) {
      this.memoryService.addAssistantMessage(sessionId, response.answer);
    }

    this.logger.log('Resposta gerada com sucesso.');

    return { answer: response.answer };
  }
}
