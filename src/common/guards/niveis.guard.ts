import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { NIVEL_MINIMO_KEY } from '../decorators/nivel-minimo.decorator';
import { NivelAcesso, nivelAtende } from '../constants';
import { Reflector } from '@nestjs/core';

@Injectable()
export class NiveisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const nivelMinimo = this.reflector.getAllAndOverride<NivelAcesso>(
      NIVEL_MINIMO_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!nivelMinimo) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user?.role || !nivelAtende(user.role, nivelMinimo)) {
      throw new ForbiddenException(
        'Você não tem permissão para acessar este recurso!',
      );
    }

    return true;
  }
}
