import {
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiBody,
} from '@nestjs/swagger';
import {
  Controller,
  UseGuards,
  Request,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { LocalRequest, RefreshTokenRequest } from 'src/common/interfaces';
import { LogoutResponseDto } from './dto/autentica-usuario-response.dto';
import { LocalAuthGuard, RefreshTokenGuard } from 'src/common/guards';
import { AutenticaUsuarioDto } from './dto/autentica-usuario.dto';
import { Public } from 'src/common/decorators';
import { AuthService } from './auth.service';
import * as Express from 'express';
import { AuthGuard } from '@nestjs/passport';

@Public()
@Controller('auth')
@ApiTags('Autenticação')
export class AuthController {
  constructor(
    private readonly logger: Logger,
    private readonly authService: AuthService,
  ) {}

  @ApiCreatedResponse({
    description: 'Conta conectada com sucesso!',
  })
  @ApiBadRequestResponse({
    description: 'Requisição inválida!',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas!',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado!',
  })
  @ApiBody({
    description: 'Dados para login',
    type: AutenticaUsuarioDto,
  })
  @ApiOperation({
    summary: 'Realiza o login de um usuário',
    description:
      'Realiza o login de um usuário com base nas credenciais passadas no corpo da requisição e retorna os tokens de acesso e refresh...',
  })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Request() req: LocalRequest,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const { refreshToken, ...data } = await this.authService.login(req.user);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    this.logger.debug(`Usuario ${req.user.login} logado!`, {
      user: JSON.stringify(req.user.login),
    });

    return data;
  }

  @ApiOkResponse({
    description: 'Sessão atualizada com sucesso!',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas!',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado!',
  })
  @ApiBadRequestResponse({
    description: 'Requisição inválida!',
  })
  @ApiOperation({
    summary: 'Atualiza os tokens de um usuário',
    description: 'Atualiza os tokens de acesso de um usuário...',
  })
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  async refresh(
    @Request() req: RefreshTokenRequest,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const login = req.user.login;
    const refreshToken = req.user.refreshToken;

    const { accessToken, newRefreshToken } =
      await this.authService.atualizaTokens(login, refreshToken);

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    return {
      accessToken,
    };
  }

  @ApiOkResponse({
    description: 'Usuário desconectado com sucesso!',
  })
  @ApiUnauthorizedResponse({
    description: 'Credenciais inválidas!',
  })
  @ApiNotFoundResponse({
    description: 'Usuário não encontrado!',
  })
  @ApiBadRequestResponse({
    description: 'Requisição inválida!',
  })
  @ApiOperation({
    summary: 'Desconecta um usuário',
    description: 'Desconecta um usuário com base seu ID...',
  })
  @UseGuards(RefreshTokenGuard)
  @Post('/logout')
  async logout(
    @Request() req: RefreshTokenRequest,
    @Res({ passthrough: true }) res: Express.Response,
  ): Promise<LogoutResponseDto> {
    const login = req.user.login;
    const refreshToken = req.user.refreshToken;

    await this.authService.logout(login, refreshToken);

    res.clearCookie('refresh_token');

    return {
      statusCode: 200,
      message: 'Usuário desconectado com sucesso!',
    };
  }
}
