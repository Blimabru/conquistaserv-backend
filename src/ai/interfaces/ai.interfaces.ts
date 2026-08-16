export interface IngestResult {
  success: boolean;
  totalDocuments: number;
  totalChunks: number;
  message: string;
}

export interface AskQuestionResult {
  answer: string;
}

export interface TrainingStatus {
  initialized: boolean;
  totalChunks: number;
  lastIngestedAt: Date | null;
}

export interface AiModelConfig {
  modelName: string;
  temperature: number;
}
