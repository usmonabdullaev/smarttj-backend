import { Response, Request } from 'express';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { LoggerService } from '@/logger/logger.service';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new LoggerService(AllExceptionsFilter.name);

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
    } else if (exception instanceof Error) {
      message = exception.message || message;
      code = (exception as any).code ?? code;
      error = (exception as any).error ?? null;
      if (typeof (exception as any).status === 'number') {
        status = (exception as any).status;
      }
    } else {
      try {
        const parsed = JSON.parse(JSON.stringify(exception));

        if (parsed?.status && typeof parsed.status === 'number') {
          status = parsed.status;
        }

        if (
          parsed?.error?.message &&
          typeof parsed.error.message === 'string'
        ) {
          message = parsed.error.message;
        }

        if (parsed?.code && typeof parsed.code === 'string') {
          code = parsed.code;
        }

        error = parsed?.error || parsed;
      } catch {
        // Ignore serialization failure
      }
    }

    if (process.env.NODE_ENV !== 'production' || +status >= 500) {
      this.logger.error('HTTP Exception', {
        status,
        message,
        code,
        error,
        path: request.url,
        method: request.method,
        stack: exception instanceof Error ? exception.stack : undefined,
      });
    }

    response.status(status).json({
      message,
      code,
      error,
    });
  }
}
