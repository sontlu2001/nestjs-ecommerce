import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { RegisterReqDTO, RegisterResDTO, SendOTPBodyDTO } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterReqDTO) {
    return this.authService.register(body);
  }

  @Post('otp')
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body);
  }
}
