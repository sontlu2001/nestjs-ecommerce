import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from 'src/shared/services/hasing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { LoginDTO, RegisterDTO } from './auth.dto';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
  ) {}

  async register(body: RegisterDTO) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password);
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
        },
      });
      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  async login(body: LoginDTO) {
    try {
      const user = await this.prismaService.user.findUnique({ where: { email: body.email } });
      if (!user) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const isPasswordMatching = this.hashingService.hash(body.password);
      if (!isPasswordMatching) {
        throw new UnprocessableEntityException([{ field: 'password', error: 'Password does not match' }]);
      }

      const tokens = await this.tokenService.generateTokens({ userId: user.id });

      return tokens;
    } catch (error) {
      throw error;
    }
  }
}
