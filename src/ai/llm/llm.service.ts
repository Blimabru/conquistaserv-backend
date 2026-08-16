import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from '@langchain/openai';
import { AiConfigService } from '../config/ai-config.service';

@Injectable()
export class LlmService {
  constructor(private readonly aiConfig: AiConfigService) {}

  createChatModel(): ChatOpenAI {
    const config = this.aiConfig.getModelConfig();

    return new ChatOpenAI({
      modelName: config.modelName,
      temperature: config.temperature,
    });
  }
}
