import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO, RegisterResponseDTO } from './auth.dto';
import { ZodSerializerDto } from 'nestjs-zod';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ZodSerializerDto(RegisterResponseDTO)
  async register(@Body() body: RegisterDTO) {
    return this.authService.register(body);
  }
}
