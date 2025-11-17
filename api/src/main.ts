import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS配置
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger文档
  const config = new DocumentBuilder()
    .setTitle('企业级会议系统API')
    .setDescription('企业级会议预约管理系统API文档')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`API Documentation: http://localhost:${port}/api/docs`);
}

bootstrap();