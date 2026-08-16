import { Controller, Get, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { NivelMinimo } from '../../common/decorators';
import { ApiSearchOperation } from '../../common/documentation';
import { FeedbacksService } from './feedbacks.service';

@ApiBearerAuth()
@NivelMinimo('ADMIN')
@Controller('feedbacks')
@ApiTags('Feedbacks e Métricas')
export class FeedbacksController {
  constructor(private readonly feedbacksService: FeedbacksService) {}

  @Get('metrics')
  @ApiSearchOperation({
    summary: 'Métricas de Feedback',
    description: 'Retorna KPIs agregados, gráficos de evolução e ranking de serviços para o painel.',
  })
  async getMetrics(@Query('dias') dias?: string) {
    const periodo = dias ? parseInt(dias, 10) : undefined;
    return this.feedbacksService.getMetrics(periodo);
  }

  @Get('recentes')
  @ApiSearchOperation({
    summary: 'Feedbacks Recentes',
    description: 'Retorna os últimos feedbacks com paginação/limite.',
  })
  async getRecentes(@Query('dias') dias?: string, @Query('limit') limit?: string) {
    const periodo = dias ? parseInt(dias, 10) : undefined;
    const l = limit ? parseInt(limit, 10) : 10;
    return this.feedbacksService.getRecentes(periodo, l);
  }
}
