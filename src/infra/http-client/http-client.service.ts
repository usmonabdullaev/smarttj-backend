import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  HttpClient,
  HttpClientError,
  HttpResponseError,
  HttpTimeoutError,
} from '@nestjs/http-client';
import { OpenLoggerService } from 'open-logger';
import jwt from 'jsonwebtoken';

import {
  HttpClientModuleOptions,
  InternalHttpRequestOptions,
} from './interfaces/http-client-options.interface';

@Injectable()
export class HttpClientService {
  constructor(
    private readonly http: HttpClient,
    @Inject('HTTP_CLIENT_OPTIONS')
    private readonly options: HttpClientModuleOptions,
    private readonly logger: OpenLoggerService,
  ) {}

  /**
   * Генерация M2M токена с временем жизни 60 секунд
   */
  private generateToken(targetService: string): string {
    return jwt.sign(
      {
        iss: this.options.serviceName,
        aud: targetService,
      },
      this.options.secret,
      { expiresIn: '60s', algorithm: 'HS256' },
    );
  }

  /**
   * Универсальный метод отправки внутреннего HTTP-запроса
   */
  async request<T = any>(
    targetService: string,
    config: InternalHttpRequestOptions,
  ): Promise<T> {
    const token = this.generateToken(targetService);
    const url = config.url || '';

    const headers: Record<string, any> = {};

    if (config.headers) {
      if (config.headers instanceof Headers) {
        config.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else {
        Object.assign(headers, config.headers);
      }
    }

    headers['x-internal-token'] = token;

    const { url: _url, data, ...restConfig } = config;

    const requestOptions: InternalHttpRequestOptions = {
      ...restConfig,
      method: config.method || 'GET',
      headers,
      timeout: config.timeout ?? 5000,
    };

    if (
      data !== undefined &&
      requestOptions.json === undefined &&
      requestOptions.body === undefined
    ) {
      requestOptions.json = data;
    }

    try {
      const response = await this.http.request<T>(url, requestOptions);
      return response.data;
    } catch (error) {
      this.handleHttpError(error, targetService, url);
    }
  }

  // Удобные алиасы
  get<T = any>(
    targetService: string,
    url: string,
    config?: InternalHttpRequestOptions,
  ) {
    return this.request<T>(targetService, { ...config, method: 'GET', url });
  }

  post<T = any>(
    targetService: string,
    url: string,
    data?: any,
    config?: InternalHttpRequestOptions,
  ) {
    return this.request<T>(targetService, {
      ...config,
      method: 'POST',
      url,
      data,
    });
  }

  put<T = any>(
    targetService: string,
    url: string,
    data?: any,
    config?: InternalHttpRequestOptions,
  ) {
    return this.request<T>(targetService, {
      ...config,
      method: 'PUT',
      url,
      data,
    });
  }

  patch<T = any>(
    targetService: string,
    url: string,
    data?: any,
    config?: InternalHttpRequestOptions,
  ) {
    return this.request<T>(targetService, {
      ...config,
      method: 'PATCH',
      url,
      data,
    });
  }

  delete<T = any>(
    targetService: string,
    url: string,
    config?: InternalHttpRequestOptions,
  ) {
    return this.request<T>(targetService, { ...config, method: 'DELETE', url });
  }

  private handleHttpError(
    error: unknown,
    targetService: string,
    url?: string,
  ): never {
    if (error instanceof HttpException) {
      throw error;
    }

    let status = HttpStatus.SERVICE_UNAVAILABLE;
    let errorData: any = null;

    if (error instanceof HttpResponseError) {
      status = error.status || HttpStatus.INTERNAL_SERVER_ERROR;
      errorData = error.body;
    } else if (error instanceof HttpTimeoutError) {
      status = HttpStatus.GATEWAY_TIMEOUT;
      errorData = error.message;
    } else if (error instanceof HttpClientError) {
      status = HttpStatus.BAD_GATEWAY;
      errorData = error.message;
    } else if (error instanceof Error) {
      errorData = error.message;
    }

    this.logger.error(
      `[Internal HTTP Error] target: ${targetService} | url: ${url} | status: ${status}`,
      errorData || (error instanceof Error ? error.message : String(error)),
    );

    // Пробрасываем ошибку дальше в NestJS пайплайн
    throw new HttpException(
      errorData || `Internal communication failure with ${targetService}`,
      status,
    );
  }
}
