import { Response } from 'express';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : 500;

    const json =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: 'Internal Server Error' };

    const message =
      typeof (json as any)?.message === 'object'
        ? (json as any)?.message?.[0]
        : (json as any)?.message;

    const payload = {
      code: (json as any)?.code || 'UNKNOWN_ERROR',
      message: message || 'Something went wrong',
      error: (json as any)?.error || null,
    };

    response.status(status).json(payload);
  }
}
