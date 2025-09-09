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
