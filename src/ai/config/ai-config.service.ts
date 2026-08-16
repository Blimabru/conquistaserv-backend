import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiModelConfig } from '../interfaces/ai.interfaces';

@Injectable()
export class AiConfigService {
  constructor(private readonly configService: ConfigService) {}

  get modelName(): string {
    return this.configService.get<string>('AI_MODEL_NAME', 'gpt-4o-mini');
  }

  get temperature(): number {
    return Number(this.configService.get<number>('AI_TEMPERATURE', 0));
  }

  get chunkSize(): number {
    return Number(this.configService.get<number>('AI_CHUNK_SIZE', 1000));
  }

  get chunkOverlap(): number {
    return Number(this.configService.get<number>('AI_CHUNK_OVERLAP', 200));
  }

  get docsPath(): string {
    return this.configService.get<string>('AI_DOCS_PATH', './docs/training');
  }

  get openaiApiKey(): string {
    return this.configService.get<string>('OPENAI_API_KEY', '');
  }

  get systemPromptPath(): string {
    return this.configService.get<string>(
      'AI_SYSTEM_PROMPT_PATH',
      './docs/prompts/system-prompt.md',
    );
  }

  getModelConfig(): AiModelConfig {
    return {
      modelName: this.modelName,
      temperature: this.temperature,
    };
  }
}
