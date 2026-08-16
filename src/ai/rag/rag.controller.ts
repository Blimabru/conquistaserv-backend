import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RagService } from './rag.service';
import { MemoryService } from '../memory/memory.service';

@Controller('ai')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly memoryService: MemoryService,
  ) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async askQuestion(
    @Body('question') question: string,
    @Body('sessionId') sessionId?: string,
  ) {
    if (!question) {
      return { error: 'O campo "question" é obrigatório.' };
    }

    const result = await this.ragService.askQuestion(question, sessionId);
    return { ...result, sessionId: sessionId || null };
  }

  @Post('reload-prompt')
  @HttpCode(HttpStatus.OK)
  reloadPrompt() {
    this.ragService.reloadPrompt();
    return { message: 'Prompt recarregado com sucesso.' };
  }

  // === Endpoints de Memória ===

  @Get('sessions')
  @HttpCode(HttpStatus.OK)
  listSessions() {
    return this.memoryService.listSessions();
  }

  @Get('sessions/:sessionId/history')
  @HttpCode(HttpStatus.OK)
  getSessionHistory(@Param('sessionId') sessionId: string) {
    const history = this.memoryService.getHistory(sessionId);
    return { sessionId, messages: history };
  }

  @Delete('sessions/:sessionId')
  @HttpCode(HttpStatus.OK)
  clearSession(@Param('sessionId') sessionId: string) {
    this.memoryService.clearSession(sessionId);
    return { message: `Sessão ${sessionId} limpa com sucesso.` };
  }

  @Delete('sessions')
  @HttpCode(HttpStatus.OK)
  clearAllSessions() {
    this.memoryService.clearAllSessions();
    return { message: 'Todas as sessões foram limpas.' };
  }
}
