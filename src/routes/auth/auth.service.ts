import { ConflictException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from 'src/shared/services/hasing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { RolesService } from './roles.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly rolesService: RolesService,
  ) {}

  async register(data: any) {
    try {
      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(data.password);
      const user = await this.prismaService.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          name: data.name,
          phoneNumber: data.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      });
      return user;
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
