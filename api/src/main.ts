import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  const config = new DocumentBuilder()
    .setTitle('Weather Monitoring API - GDASH Challenge')
    .setDescription('Sistema de monitoramento climático com integração Python → RabbitMQ → Go → NestJS')
    .setVersion('1.0')
    .addTag('auth', 'Endpoints de autenticação (login, registro)')
    .addTag('users', 'CRUD de usuários')
    .addTag('weather', 'Dados climáticos e insights de IA')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Token JWT obtido no endpoint /auth/login',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`🚀 API rodando em: http://localhost:${process.env.PORT ?? 3000}`);
  console.log(`📚 Swagger disponível em: http://localhost:${process.env.PORT ?? 3000}/api`);
}
bootstrap();
