import { Body, Controller, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { LoginBodyDTO, RegisterReqDTO, RegisterResDTO, SendOTPBodyDTO } from './auth.dto';
import { UserAgent } from 'src/shared/decorators/user-agent.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterReqDTO) {
    return this.authService.register(body);
  }

  @Post('otp')
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return this.authService.sendOTP(body);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ipAddress: string) {
    return this.authService.login({ ...body, userAgent: userAgent, ipAddress: ipAddress });
  }
}
