import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

import { LoggerService } from '@/logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let code = 'INTERNAL_ERROR';
    let error: any = null;

    if (exception instanceof HttpException) {
      status = exception.getStatus();

      const res = exception.getResponse();

      if (typeof res === 'string') {
        message = res;
      } else if (typeof res === 'object' && res !== null) {
        const r = res as any;

        if (typeof r.message === 'string') {
          message = r.message;
        } else if (Array.isArray(r.message) && r.message.length > 0) {
          message = r.message[0];
        } else if (r.message) {
          message = r.message;
        }

        code = r.code ?? code;
        error = r.error ?? null;
      }
    }

    this.logger.error('HTTP Exception', {
      status,
      message,
      code,
      error,
      path: request.url,
      method: request.method,
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    response.status(status).json({
      message,
      code,
      error,
    });
  }
}
