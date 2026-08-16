import { Controller, Post, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { TrainingService } from './training.service';

@Controller('ai/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.OK)
  async ingest() {
    const result = await this.trainingService.ingest();
    return result;
  }

  @Post('reingest')
  @HttpCode(HttpStatus.OK)
  async reingest() {
    const result = await this.trainingService.reingest();
    return result;
  }

  @Get('status')
  @HttpCode(HttpStatus.OK)
  getStatus() {
    return this.trainingService.getStatus();
  }
}
