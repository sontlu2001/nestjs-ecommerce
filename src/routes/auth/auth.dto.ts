import { Exclude } from 'class-transformer';
import { IsString } from 'class-validator';

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
