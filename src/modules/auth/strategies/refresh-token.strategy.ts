import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtRefreshPayload } from '../../../common/types';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(configService: ConfigService) {
    super({
      secretOrKey: configService.get<string>('REFRESH_TOKEN_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          const refreshToken = req?.cookies?.['refresh_token'];
          if (!refreshToken) {
            throw new BadRequestException('Token de atualização inválido!');
          }
          return refreshToken;
        },
      ]),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtRefreshPayload) {
    if (!payload) {
      throw new BadRequestException('Token JWT inválido!');
    }

    const refreshToken = req.cookies?.['refresh_token'];

    return {
      role: payload.role,
      sub: payload.sub,
      login: payload.login,
      refreshToken,
    };
  }
}
