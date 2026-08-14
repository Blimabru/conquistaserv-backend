import {
  ExecutionContext,
  NestInterceptor,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { LoggingService } from 'src/shared/services/logging.service';
import { Request, Response } from 'express';
import { sanitizeBody } from '../utils';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggingService: LoggingService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const latency = Date.now() - now;
        const { method, path, ip, body } = request;
        const statusCode = response.statusCode;
        const userAgent = request.get('user-agent');

        const userPayload = request.user as { id?: string; sub?: string };
        const userId = userPayload?.id || userPayload?.sub || null;

        const sanitizedBody =
          body && Object.keys(body).length > 0 ? sanitizeBody(body) : undefined;

        const logData = {
          userId,
          ipAddress: ip,
          method,
          path,
          statusCode,
          body: sanitizedBody,
          latency,
          userAgent,
          serviceName: context.getClass().name,
          actionName: context.getHandler().name,
        };

        this.loggingService.createLog(logData);
      }),
    );
  }
}
