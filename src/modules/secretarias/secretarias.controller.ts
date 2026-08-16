import { Controller, Get, Post, Patch, Delete, Param, Query, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiSearchOperation,
  ApiUpdateOperation,
} from 'src/common/documentation';
import { NivelMinimo } from 'src/common/decorators';
import { SecretariasService } from './secretarias.service';
import { CriaSecretariaDto } from './dto/cria-secretaria.dto';
import { AtualizaSecretariaDto } from './dto/atualiza-secretaria.dto';
import { BuscaSecretariasDto } from './dto/busca-secretarias.dto';

@ApiBearerAuth()
@NivelMinimo('ADMIN')
@Controller('secretarias')
@ApiTags('Secretarias')
export class SecretariasController {
  constructor(private readonly secretariasService: SecretariasService) {}

  @Get()
  @ApiSearchOperation({
    summary: 'Lista secretarias',
    description: 'Retorna as secretarias cadastradas, cada uma com o canal vinculado.',
  })
  async buscaTodos(@Query() queryParams: BuscaSecretariasDto) {
    const { pagina, itensPorPagina, busca } = queryParams;
    return this.secretariasService.buscaTodos(
      pagina || 1,
      itensPorPagina || 10,
      busca || '',
    );
  }

  @Get('/:id')
  @ApiSearchOperation({
    summary: 'Busca uma secretaria',
    description: 'Retorna uma secretaria específica com o canal vinculado.',
  })
  async buscaPorId(@Param('id') id: string) {
    return this.secretariasService.buscaPorId(id);
  }

  @Post()
  @ApiCreateOperation({
    summary: 'Cria uma secretaria',
    description: 'Cria a secretaria e, junto, o canal público exclusivo dela (1:1).',
  })
  async cria(@Body() dados: CriaSecretariaDto) {
    return this.secretariasService.cria(dados);
  }

  @Patch('/:id')
  @ApiUpdateOperation({
    summary: 'Atualiza uma secretaria',
    description: 'Atualiza nome/descrição da secretaria. Não altera o canal vinculado.',
  })
  async atualiza(@Param('id') id: string, @Body() dados: AtualizaSecretariaDto) {
    return this.secretariasService.atualiza(id, dados);
  }

  @Delete('/:id')
  @ApiDeleteOperation({
    summary: 'Exclui uma secretaria',
    description: 'Soft delete da secretaria e do canal vinculado.',
  })
  async deleta(@Param('id') id: string) {
    return this.secretariasService.deleta(id);
  }
}
