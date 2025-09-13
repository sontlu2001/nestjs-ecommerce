import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO, LoginResDTO, RegisterDTO, RegisterResDTO } from './auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: RegisterDTO) {
    return new RegisterResDTO(await this.authService.register(body));
  }

  @Post('login')
  async login(@Body() body: LoginDTO) {
    return new LoginResDTO(await this.authService.login(body));
  }
}
