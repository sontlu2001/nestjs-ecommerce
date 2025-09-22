import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './shared/interceptors/tranform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true, // allows automatic conversion of types (e.g., string to number)
      },
      exceptionFactory: (errors) => {
        return new BadRequestException(
          errors.map((err) => ({
            property: err.property,
            error: Object.values(err.constraints as any).join(', '),
          })),
        );
      },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
