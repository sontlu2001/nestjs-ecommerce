import { RegisterReqSchema, RegisterResSchema, SendOTPBodySchema } from './auth.model';
import { createZodDto } from 'nestjs-zod';

export class RegisterReqDTO extends createZodDto(RegisterReqSchema) {}
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
