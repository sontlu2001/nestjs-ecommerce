import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';
import { Match } from 'src/shared/decorators/matched-password';

export class LoginDTO {
  @IsString()
  email: string;

  @IsString()
  password: string;
}

export class RegisterDTO extends LoginDTO {
  @IsString()
  name: string;

  @IsString()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}

export class RegisterResDTO {
  userId: number;
  email: string;
  name: string;
  @Exclude() password: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<RegisterResDTO>) {
    Object.assign(this, partial);
  }
}

export class LoginResDTO {
  accessToken: string;
  refreshToken: string;

  constructor(partial: Partial<LoginResDTO>) {
    Object.assign(this, partial);
  }
}

export class RefreshTokenBodyDTO {
  @IsString()
  refreshToken: string;
}

export class RefreshTokenResDTO extends LoginResDTO {}

export class LogoutBodyDTO extends RefreshTokenBodyDTO {}

export class LogoutResDTO {
  message: string;
  constructor(partial: Partial<LogoutResDTO>) {
    Object.assign(this, partial);
  }
}
