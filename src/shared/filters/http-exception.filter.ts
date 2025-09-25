import { ArgumentsHost, Catch, HttpException, Logger } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { ZodSerializationException } from 'nestjs-zod';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    if (exception instanceof ZodSerializationException) {
      const zodError = exception.getZodError();
      if (zodError && typeof zodError === 'object' && 'message' in zodError) {
        this.logger.error(`ZodSerializationException: ${(zodError as { message: string }).message}`);
      }
    }
    super.catch(exception, host);
  }
}
