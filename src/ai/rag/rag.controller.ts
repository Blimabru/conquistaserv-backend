import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import OpenAI from 'openai';
import * as fs from 'fs';
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
    @Body('context') context?: any,
  ) {
    if (!question) {
      return { error: 'O campo "question" é obrigatório.' };
    }

    const result = await this.ragService.askQuestion(
      question,
      sessionId,
      context,
    );
    return { ...result, sessionId: sessionId || null };
  }

  @Post('audio-chat')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('audio'))
  async askAudioQuestion(
    @UploadedFile() file: Express.Multer.File,
    @Body('sessionId') sessionId?: string,
    @Body('context') contextStr?: string,
  ) {
    if (!file) {
      return { error: 'O arquivo de áudio é obrigatório.' };
    }

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const tempFilePath = `/tmp/${Date.now()}-audio.webm`;
      fs.writeFileSync(tempFilePath, file.buffer as any);

      const transcription = await openai.audio.transcriptions.create({
        file: fs.createReadStream(tempFilePath),
        model: 'whisper-1',
        language: 'pt',
      });

      fs.unlinkSync(tempFilePath);

      const text = transcription.text;
      let context = {};
      try {
        if (contextStr) context = JSON.parse(contextStr);
      } catch (e) {}

      // Registra a transcrição real na memória caso queira logar
      console.log(`[Audio] Transcrito: "${text}"`);

      const result = await this.ragService.askQuestion(
        text,
        sessionId,
        context,
      );
      return { ...result, sessionId: sessionId || null, transcribedText: text };
    } catch (error) {
      console.error('Erro na transcrição Whisper:', error);
      return {
        answer:
          'Poxa, tive um probleminha técnico para entender o áudio. Pode tentar enviar de novo?',
        sessionId,
      };
    }
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
