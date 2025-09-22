import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginDTO,
  LoginResDTO,
  LogoutBodyDTO,
  LogoutResDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterDTO,
  RegisterResDTO,
} from './auth.dto';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AuthType, ConditionGuard } from 'src/shared/constants/auth.contant';
import { AuthenticationGuard } from 'src/shared/guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
}
