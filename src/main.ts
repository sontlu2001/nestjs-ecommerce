import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './shared/interceptors/tranform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
