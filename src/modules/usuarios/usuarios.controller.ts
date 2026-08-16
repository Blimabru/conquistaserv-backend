import {
  Controller,
  Delete,
  Param,
  Patch,
  Query,
  Body,
  Post,
  Get,
  Request,
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
import { NivelMinimo } from 'src/common/decorators';
import { AccessTokenRequest } from 'src/common/interfaces';

@ApiBearerAuth()
@NivelMinimo('ADMIN')
@Controller('usuarios')
@ApiTags('Usuários')
export class UsuariosController {
  constructor(private readonly usuarioService: UsuariosService) {}

  @Get()
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

  @Get('/me')
  @NivelMinimo('USUARIO')
  @ApiSearchOperation({
    summary: 'Busca o usuário autenticado',
    description:
      'Retorna os dados do usuário dono do token de acesso informado, sem exigir nível de administrador...',
  })
  async buscaUsuarioAutenticado(
    @Request() req: AccessTokenRequest,
  ): Promise<any> {
    return this.usuarioService.buscaPorId(req.user.sub);
  }

  @Patch('/me/onboarding')
  @NivelMinimo('USUARIO')
  @ApiUpdateOperation({
    summary: 'Conclui o onboarding do usuário autenticado',
    description:
      'Marca o tour de onboarding como concluído para o usuário dono do token de acesso informado, sem exigir nível de administrador...',
  })
  async concluiOnboarding(@Request() req: AccessTokenRequest): Promise<any> {
    return this.usuarioService.marcaOnboardingConcluido(req.user.sub);
  }

  @Get('/:id')
  @ApiSearchOperation({
    summary: 'Busca um usuário',
    description:
      'Faz uma busca que retorna um usuário específico com base no ID passado como parâmetro...',
  })
  async buscaPorId(@Param('id') id: string): Promise<any> {
    return this.usuarioService.buscaPorId(id);
  }

  @Post()
  @ApiCreateOperation({
    summary: 'Cria um usuário',
    description:
      'Cria um usuário com base nos dados passados no corpo da requisição...',
  })
  async cria(@Body() dados: CriaUsuarioDto): Promise<any> {
    return await this.usuarioService.cria(dados);
  }

  @Patch('/:id')
  @ApiUpdateOperation({
    summary: 'Atualiza um usuário',
    description:
      'Atualiza um usuário com base no ID passado como parâmetro e dados passados no corpo da requisição...',
  })
  async atualiza(@Param('id') id: string, @Body() data: AtualizaUsuarioDto) {
    return await this.usuarioService.atualiza(id, data);
  }

  @Delete('/:id')
  @ApiDeleteOperation({
    summary: 'Exclui um usuário',
    description: 'Exclui um usuário com base no ID passado como parâmetro...',
  })
  async deleta(@Param('id') id: string) {
    return await this.usuarioService.deleta(id);
  }
}
