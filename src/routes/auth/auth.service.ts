import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from 'src/shared/services/hasing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { RolesService } from './roles.service';
import { RegisterReqType } from './auth.model';
import { AuthRepository } from './auth.repo';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
  ) {}

  async register(data: RegisterReqType) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(data.password);
      return await this.authRepository.createUser({
        email: data.email,
        name: data.name,
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        roleId: clientRoleId,
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Email already exists');
        }
      }
      throw error;
    }
  }
}
