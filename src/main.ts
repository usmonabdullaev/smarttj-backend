import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';

import { AppModule } from '@/app.module';

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';
const PREFIX = 'api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix(PREFIX);

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
  });

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

  const config = new DocumentBuilder()
    .setTitle('Smart Shop')
    .setContact(
      'Abdulloev Usmon',
      'https://abdulloev-usmon.vercel.app',
      'abdullaevusmon2006@gmail.com',
    )
    .setDescription('The Smart Shop API documentation')
    .setVersion('1.0')
    .addServer(`http://localhost:${PORT}/${PREFIX}`, 'Localhost')
    .addServer(`http://169.58.46.174:${PORT}/${PREFIX}`, 'Server (IP) - HTTP')
    .addServer(
      `http://smarttj.duckdns.org/${PREFIX}`,
      'Server (DuckDNS) - HTTP',
    )
    .addServer(
      `https://smarttj.duckdns.org/${PREFIX}`,
      'Server (DuckDNS) - HTTPS',
    )
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Введите JWT токен',
      in: 'header',
    })
    .build();

  SwaggerModule.setup(
    PREFIX,
    app,
    SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true }),
  );

  await app.listen(PORT, HOST);
}
void bootstrap();
