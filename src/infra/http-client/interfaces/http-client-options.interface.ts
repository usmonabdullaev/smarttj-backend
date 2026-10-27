import type { HttpRequestOptions } from '@nestjs/http-client';

export interface HttpClientModuleOptions {
  serviceName: string; // Имя текущего сервиса (iss)
  secret: string; // Общий JWT секрет
}

export interface InternalHttpRequestOptions extends HttpRequestOptions {
  url?: string;
  data?: any;
}
