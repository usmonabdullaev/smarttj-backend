import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as fs from 'fs';

import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const httpsOptions = {
    key: fs.readFileSync('./ssl/key.pem'),
    cert: fs.readFileSync('./ssl/cert.pem'),
  };

  const app = await NestFactory.create(AppModule, {
    httpsOptions,
  });

  app.enableCors({
    origin: ['https://localhost:3000'],
  });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('SmartTJ API')
    .setDescription('The SmartTJ API documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000/api', 'Local (HTTP)')
    .addServer('https://localhost:3000/api', 'Local (HTTPS)')
    .addServer('http://10.201.14.142:3000/api', 'IP (HTTP)')
    .addServer('https://10.201.14.142:3000/api', 'IP (HTTPS)')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Введите JWT токен',
      in: 'header',
    })
    .addTag('Auth', 'Authorization')
    .build();

  SwaggerModule.setup(
    'api',
    app,
    SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
