import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { OpenLoggerService } from 'open-logger';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { NestFactory } from '@nestjs/core';

import { AppModule, ObserveInstrument } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    instrument: ObserveInstrument,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(OpenLoggerService);
  app.use(OpenLoggerService);

  console.log('DEBUG REDIS CONFIG:', {
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    username: process.env.REDIS_USERNAME,
    password: process.env.REDIS_PASSWORD ? '****** (defined)' : 'MISSING!',
  });

  const PORT = configService.get('PORT', 3000);
  const HOST = '0.0.0.0';
  const PREFIX = 'api';

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
    .setTitle('SmartTJ')
    .setContact(
      'Abdulloev Usmon',
      'https://abdulloev-usmon.vercel.app',
      'abdullaevusmon2006@gmail.com',
    )
    .setDescription('The SmartTJ API documentation')
    .setVersion('1.0')
    .addServer(`http://localhost:${PORT}/${PREFIX}`, 'Localhost')
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
    SwaggerModule.createDocument(app, config, {
      ignoreGlobalPrefix: true,
    }),
    {
      jsonDocumentUrl: `${PREFIX}-json`,
      yamlDocumentUrl: `${PREFIX}-yaml`,
    },
  );

  await app.listen(PORT, HOST, () =>
    logger.log(
      `Server successfully started in: http://${HOST}:${PORT}, docs: /${PREFIX}`,
      null,
      {
        save: false,
      },
    ),
  );
}

void bootstrap();
