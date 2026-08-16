import { Injectable } from '@nestjs/common';
import { OpenAIEmbeddings } from '@langchain/openai';
import { AiConfigService } from '../config/ai-config.service';

@Injectable()
export class EmbeddingsService {
  constructor(private readonly aiConfig: AiConfigService) {}

  createEmbeddings(): OpenAIEmbeddings {
    return new OpenAIEmbeddings({
      openAIApiKey: this.aiConfig.openaiApiKey,
    });
  }
}
