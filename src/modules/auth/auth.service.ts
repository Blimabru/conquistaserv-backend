import { PrismaService } from 'src/plugins/database/services/prisma.service';
import { JwtPayload, JwtRefreshPayload, Usuario } from '../../common/types';
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: Logger,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usuarioService: UsuariosService,
  ) {}

  async login(usuario: Usuario) {
    const { accessToken, refreshToken } = await this._buscaTokens(usuario);
    await this._atualizaRefreshToken(usuario.id, refreshToken);

    return {
      refreshToken,
      accessToken,
      nivel: usuario.nivel,
      userId: usuario.id,
    };
  }

  async atualizaTokens(login: string, refreshToken: string) {
    const usuario = await this.usuarioService.buscaPorLogin(login);

    await this._validaRefreshToken(refreshToken, usuario);

    const { accessToken, refreshToken: newRefreshToken } =
      await this._buscaTokens(usuario);

    await this._atualizaRefreshToken(usuario.id, refreshToken);

    return {
      accessToken,
      newRefreshToken,
    };
  }

  async logout(login: string, refreshToken: string) {
    const user = await this.usuarioService.buscaPorLogin(login);

    await this._validaRefreshToken(refreshToken, user);

    await this.prisma.usuario.update({
      where: {
        login,
      },
      data: {
        refreshToken: null,
      },
    });
  }

  async validaUsuario(login: string, senha: string): Promise<Usuario> {
    const usuario = await this.usuarioService.buscaPorLogin(login);

    if (!usuario) {
      this.logger.warn(`Usuário não encontrado: ${login}`);
      throw new UnauthorizedException('Usuário ou senha inválidos!');
    }

    if (usuario.situacao !== 'ATIVO') {
      this.logger.warn(`Usuário Inativo ou Bloqueado: ${login}`);
      throw new UnauthorizedException('Usuário Inativo ou Bloqueado!');
    }

    const senhasCoincidem = await this.usuarioService.comparaDados(
      senha,
      usuario.senha,
    );

    if (!senhasCoincidem) {
      this.logger.warn(`Password inválido para o usuário: ${login}`);
      throw new UnauthorizedException('Senha ou usuário inválido!');
    }

    return usuario;
  }

  private async _validaRefreshToken(refreshToken: string, usuario: Usuario) {
    if (!usuario.refreshToken) {
      this.logger.warn('Refresh token inexistente!', {});
      throw new UnauthorizedException(
        'Token de atualização inválido ou expirado. Por favor, faça login novamente!',
      );
    }

    const tokensCoincidem = await this.usuarioService.comparaDados(
      refreshToken,
      usuario.refreshToken,
    );

    if (!tokensCoincidem) {
      this.logger.warn(`Refresh token inválido para o usuário: ${usuario.id}!`);
      throw new UnauthorizedException(
        'Token de atualização inválido ou expirado. Por favor, faça login novamente!',
      );
    }
  }

  private async _atualizaRefreshToken(userId: string, refreshToken: string) {
    const tokenHasheado = await this.usuarioService.hashDado(refreshToken);

    await this.prisma.usuario.update({
      where: {
        id: userId,
      },
      data: {
        refreshToken: tokenHasheado,
      },
    });
  }

  private async _buscaTokens(usuario: Usuario) {
    const accessTokenPayload: JwtPayload = {
      sub: usuario.id,
      role: usuario.nivel,
    };

    const refreshTokenPayload: JwtRefreshPayload = {
      ...accessTokenPayload,
      login: usuario.login,
    };

    return {
      accessToken: this.jwtService.sign(accessTokenPayload, {
        secret: this.configService.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('ACCESS_TOKEN_EXPIRATION'),
      }),
      refreshToken: this.jwtService.sign(refreshTokenPayload, {
        secret: this.configService.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: this.configService.get<string>('REFRESH_TOKEN_EXPIRATION'),
      }),
    };
  }
}
