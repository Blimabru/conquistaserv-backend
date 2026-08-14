import {
  Controller,
  UseGuards,
  Delete,
  Param,
  Patch,
  Query,
  Body,
  Post,
  Get,
} from '@nestjs/common';
import {
  ApiCreateOperation,
  ApiDeleteOperation,
  ApiSearchOperation,
  ApiUpdateOperation,
} from 'src/common/documentation';
import { BuscaUsuarioFilterDto } from './dto/busca-usuarios.dto';
import { AtualizaUsuarioDto } from './dto/atualiza-usuario.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CriaUsuarioDto } from './dto/cria-usuario.dto';
import { UsuariosService } from './usuarios.service';
import { AuthGuard } from '@nestjs/passport';

@ApiBearerAuth()
@Controller('usuarios')
@ApiTags('Usuários')
export class UsuariosController {
  constructor(private readonly usuarioService: UsuariosService) {}

  @Get()
  @UseGuards(AuthGuard())
  @ApiSearchOperation({
    summary: 'Busca usuários',
    description:
      'Faz uma busca que retorna um array de usuários com base nos parâmetros de filtro utilizados...',
  })
  async buscaTodos(@Query() queryParams?: BuscaUsuarioFilterDto) {
    const { busca, filtro, itensPorPagina, pagina, valor } = queryParams;

    return await this.usuarioService.buscaTodos(
      pagina,
      itensPorPagina,
      busca,
      filtro?.split(','),
      valor?.split(','),
    );
  }

  @Get('/:id')
  @UseGuards(AuthGuard())
  @ApiSearchOperation({
    summary: 'Busca um usuário',
    description:
      'Faz uma busca que retorna um usuário específico com base no ID passado como parâmetro...',
  })
  async buscaPorId(@Param('id') id: string): Promise<any> {
    return this.usuarioService.buscaPorId(id);
  }

  @Post()
  @UseGuards(AuthGuard())
  @ApiCreateOperation({
    summary: 'Cria um usuário',
    description:
      'Cria um usuário com base nos dados passados no corpo da requisição...',
  })
  async cria(@Body() dados: CriaUsuarioDto): Promise<any> {
    return await this.usuarioService.cria(dados);
  }

  @Patch('/:id')
  @UseGuards(AuthGuard())
  @ApiUpdateOperation({
    summary: 'Atualiza um usuário',
    description:
      'Atualiza um usuário com base no ID passado como parâmetro e dados passados no corpo da requisição...',
  })
  async atualiza(@Param('id') id: string, @Body() data: AtualizaUsuarioDto) {
    return await this.usuarioService.atualiza(id, data);
  }

  @Delete('/:id')
  @UseGuards(AuthGuard())
  @ApiDeleteOperation({
    summary: 'Exclui um usuário',
    description: 'Exclui um usuário com base no ID passado como parâmetro...',
  })
  async deleta(@Param('id') id: string) {
    return await this.usuarioService.deleta(id);
  }
}
