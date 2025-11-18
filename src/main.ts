import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

/**
 * Bootstrap de la aplicación para ejecución local
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS
  app.enableCors({
    origin: '*', // Configurar según necesidades de seguridad
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Configurar Swagger
  const config = new DocumentBuilder()
    .setTitle('AssetManager API')
    .setDescription(
      'Microservicio centralizado de gestión de activos digitales con arquitectura hexagonal',
    )
    .setVersion('1.0')
    .addTag('Assets', 'Endpoints para gestión de activos digitales')
    .addServer('http://localhost:3000', 'Local Development')
    .addServer('https://api.example.com', 'Production')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`
    ╔════════════════════════════════════════════════════════╗
    ║                                                        ║
    ║   🚀 AssetManager API is running!                     ║
    ║                                                        ║
    ║   📍 URL: http://localhost:${port}                        ║
    ║   📚 Swagger Docs: http://localhost:${port}/api/docs      ║
    ║                                                        ║
    ╚════════════════════════════════════════════════════════╝
  `);
}

bootstrap();
