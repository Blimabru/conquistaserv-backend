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
import { PrismaService } from '../../plugins/database/services/prisma.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  private cachedPromptTemplate: string | null = null;

  constructor(
    private readonly llmService: LlmService,
    private readonly vectorStoreService: VectorStoreService,
    private readonly aiConfig: AiConfigService,
    private readonly memoryService: MemoryService,
    private readonly prisma: PrismaService,
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
    context?: any,
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

    // --- Busca dados em tempo real do banco de dados (Contexto Dinâmico) ---
    const [beneficios, documentos, servicos, canais, publicacoes] = await Promise.all([
      this.prisma.beneficio.findMany({ where: { ativo: true, deletedAt: null } }),
      this.prisma.documento.findMany({ where: { ativo: true, deletedAt: null } }),
      this.prisma.servico.findMany({ where: { ativo: true, deletedAt: null } }),
      this.prisma.canal.findMany({ where: { deletedAt: null } }),
      this.prisma.publicacao.findMany({ where: { deletedAt: null }, orderBy: { dataPublicacao: 'desc' }, take: 10 }),
    ]);

    let dbContext = '';

    if (beneficios.length > 0) {
      dbContext += `\\n### Benefícios Disponíveis:\\n` + beneficios.map(b => `- **${b.titulo}** (${b.categoria}): ${b.descricao}`).join('\\n');
    } else {
      dbContext += `\\n### Benefícios Disponíveis:\\nAtualmente não há benefícios cadastrados no sistema.\\n`;
    }

    if (documentos.length > 0) {
      dbContext += `\\n### Documentos Disponíveis:\\n` + documentos.map(d => `- **${d.titulo}** (Versão: ${d.versao}): ${d.descricao}`).join('\\n');
    } else {
      dbContext += `\\n### Documentos Disponíveis:\\nAtualmente não há documentos cadastrados no sistema.\\n`;
    }

    if (servicos.length > 0) {
      dbContext += `\\n### Serviços Oferecidos:\\n` + servicos.map(s => `- **${s.nome}**: ${s.descricao || 'Sem descrição'}`).join('\\n');
    } else {
      dbContext += `\\n### Serviços Oferecidos:\\nAtualmente não há serviços cadastrados no sistema.\\n`;
    }

    if (canais.length > 0) {
      dbContext += `\\n### Canais de Comunicação:\\n` + canais.map(c => `- **${c.nome}**: ${c.descricao}`).join('\\n');
    } else {
      dbContext += `\\n### Canais de Comunicação:\\nAtualmente não há canais cadastrados no sistema.\\n`;
    }

    if (publicacoes.length > 0) {
      dbContext += `\\n### Últimas Publicações no Feed:\\n` + publicacoes.map(p => `- **${p.titulo}**: ${p.resumo}`).join('\\n');
    } else {
      dbContext += `\\n### Últimas Publicações no Feed:\\nAtualmente não há publicações.\\n`;
    }
    // ----------------------------------------------------------------------

    const model = this.llmService.createChatModel();

    let userContext = '';
    if (context?.userName) {
      userContext += `[INFORMAÇÃO OCULTA DE SISTEMA: O nome do servidor com quem você está falando agora é "${context.userName}". Chame-o pelo nome se for uma saudação ou se fizer sentido.]\\n`;
    }
    if (context?.currentPage) {
      userContext += `[INFORMAÇÃO OCULTA DE SISTEMA: O servidor está neste momento visualizando a tela "${context.currentPage}" do sistema. Se ele perguntar algo relacionado, leve isso em consideração.]\\n`;
    }

    // Monta o prompt substituindo {history}, {db_context} e {user_context}
    const rawTemplate = this.loadPromptTemplate();
    const history = sessionId
      ? this.memoryService.formatHistoryForPrompt(sessionId)
      : '';
      
    const templateWithHistory = rawTemplate
      .replace('{history}', history)
      .replace('{db_context}', dbContext)
      .replace('{user_context}', userContext);

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
