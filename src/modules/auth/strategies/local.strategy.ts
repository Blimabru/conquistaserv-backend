import { PassportStrategy } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'login',
      passwordField: 'senha',
    });
  }

  async validate(login: string, senha: string) {
    return await this.authService.validaUsuario(login, senha);
  }
}
