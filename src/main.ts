import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('SmartTJ API')
    .setDescription('The SmartTJ API documentation')
    .setVersion('1.0')
    .addTag('SmartTJ')
    .addServer('http://localhost:3000/api', 'Локалный')
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
    'api/docs',
    app,
    SwaggerModule.createDocument(app, config, { ignoreGlobalPrefix: true }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
