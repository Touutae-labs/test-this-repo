import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation pipes
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // Enable CORS for development
  app.enableCors();

  const port = process.env.PORT ?? 8080; // Changed to 8080 to avoid conflict with external service on 3000
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}
bootstrap();
