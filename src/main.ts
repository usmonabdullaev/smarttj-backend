import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Request, Response } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      stopAtFirstError: true,
    }),
  );
  app
    .getHttpAdapter()
    .getInstance()
    .get('/', (_: Request, res: Response) => {
      return res.redirect(301, '/api');
    });

  const config = new DocumentBuilder()
    .setTitle('SmartTJ API')
    .setDescription('The SmartTJ API documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3001/api', 'Local (HTTP)')
    .addServer('https://localhost:3001/api', 'Local (HTTPS)')
    .addServer('http://10.201.14.142:3001/api', 'IP (HTTP)')
    .addServer('https://10.201.14.142:3001/api', 'IP (HTTPS)')
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

  await app.listen(process.env.PORT ?? 3001, '0.0.0.0');
}
void bootstrap();
