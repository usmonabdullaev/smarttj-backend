import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { Request, Response } from 'express';

import { AppModule } from './app.module';

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
const PREFIX = 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(PREFIX);
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
      return res.redirect(301, `/${PREFIX}`);
    });

  const serverUrl = `http://localhost:${PORT}/${PREFIX}`;

  const config = new DocumentBuilder()
    .setTitle('Smart Shop API')
    .setContact(
      'Abdulloev Usmon',
      'https://abdulloev-usmon.vercel.app',
      'abdullaevusmon2006@gmail.com',
    )
    .setDescription('The SmartTJ API documentation')
    .setVersion('1.0')
    .addServer(serverUrl, 'Localhost')
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
    PREFIX,
    app,
    SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true }),
  );

  await app.listen(PORT, HOST);
}
void bootstrap();
