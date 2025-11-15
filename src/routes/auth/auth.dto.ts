import {
  DeviceShema,
  LoginBodySchema,
  RefreshTokenBodySchema,
  RegisterReqSchema,
  RegisterResSchema,
  SendOTPBodySchema,
} from './auth.model';
import { createZodDto } from 'nestjs-zod';

export class RegisterReqDTO extends createZodDto(RegisterReqSchema) {}
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class RefreshTokenBodyType extends createZodDto(RefreshTokenBodySchema) {}
export class DeviceBodyType extends createZodDto(DeviceShema) {}
