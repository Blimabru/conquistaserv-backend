import { QueryAnalyticsDto } from './dto/query-analytics.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { Public } from 'src/common/decorators';

@Public()
@ApiTags('Analytics')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('sumario')
  @ApiOperation({ summary: 'Obtém um resumo das métricas de requisições' })
  async getSummary(@Query() query: QueryAnalyticsDto) {
    return await this.analyticsService.getSummary(query);
  }

  @Get('top-endpoints')
  @ApiOperation({ summary: 'Lista os 10 endpoints mais acessados' })
  async getTopEndpoints(@Query() query: QueryAnalyticsDto) {
    return await this.analyticsService.getTopEndpoints(query);
  }

  @Get('atividade-usuarios')
  @ApiOperation({ summary: 'Lista os 10 usuários com mais requisições' })
  async getMostActiveUsers(@Query() query: QueryAnalyticsDto) {
    return await this.analyticsService.getMostActiveUsers(query);
  }
}
