import { Injectable, Logger } from '@nestjs/common';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SessionInfo {
  sessionId: string;
  messageCount: number;
  createdAt: Date;
  lastMessageAt: Date;
}

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);
  private readonly sessions = new Map<string, ChatMessage[]>();
  private readonly maxMessagesPerSession: number = 20;

  addUserMessage(sessionId: string, content: string): void {
    this.ensureSession(sessionId);
    this.sessions.get(sessionId)!.push({
      role: 'user',
      content,
      timestamp: new Date(),
    });
    this.trimSession(sessionId);
  }

  addAssistantMessage(sessionId: string, content: string): void {
    this.ensureSession(sessionId);
    this.sessions.get(sessionId)!.push({
      role: 'assistant',
      content,
      timestamp: new Date(),
    });
    this.trimSession(sessionId);
  }

  getHistory(sessionId: string): ChatMessage[] {
    return this.sessions.get(sessionId) || [];
  }

  formatHistoryForPrompt(sessionId: string): string {
    const history = this.getHistory(sessionId);

    const historyToFormat =
      history.length > 0 && history[history.length - 1].role === 'user'
        ? history.slice(0, -1)
        : history;

    if (historyToFormat.length === 0) {
      return '';
    }

    const formatted = historyToFormat
      .map((msg) => {
        const role = msg.role === 'user' ? 'Servidor' : 'Vitória';
        return `${role}: ${msg.content}`;
      })
      .join('\n');

    return `\n## Histórico da conversa:\n${formatted}\n`;
  }

  clearSession(sessionId: string): void {
    this.sessions.delete(sessionId);
    this.logger.log(`Sessão ${sessionId} limpa.`);
  }

  clearAllSessions(): void {
    const count = this.sessions.size;
    this.sessions.clear();
    this.logger.log(`${count} sessões limpas.`);
  }

  listSessions(): SessionInfo[] {
    const sessions: SessionInfo[] = [];

    this.sessions.forEach((messages, sessionId) => {
      if (messages.length > 0) {
        sessions.push({
          sessionId,
          messageCount: messages.length,
          createdAt: messages[0].timestamp,
          lastMessageAt: messages[messages.length - 1].timestamp,
        });
      }
    });

    return sessions;
  }

  private ensureSession(sessionId: string): void {
    if (!this.sessions.has(sessionId)) {
      this.sessions.set(sessionId, []);
      this.logger.log(`Nova sessão criada: ${sessionId}`);
    }
  }

  private trimSession(sessionId: string): void {
    const messages = this.sessions.get(sessionId);
    if (messages && messages.length > this.maxMessagesPerSession) {
      // Remove as mensagens mais antigas, mantendo as últimas
      const excess = messages.length - this.maxMessagesPerSession;
      messages.splice(0, excess);
    }
  }
}
