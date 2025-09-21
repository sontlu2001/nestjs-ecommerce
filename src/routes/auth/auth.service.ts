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

  async refreshToken(refreshToken: string) {
    try {
      const decoded = await this.tokenService.verifyRefreshToken(refreshToken);
      const storedToken = await this.prismaService.refreshToken.findUniqueOrThrow({ where: { token: refreshToken } });
      if (!storedToken || storedToken.userId !== decoded.userId) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      await this.prismaService.refreshToken.delete({ where: { token: refreshToken } });
      const tokens = await this.tokenService.generateTokens({ userId: decoded.userId });
      return tokens;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    try {
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);

      await this.prismaService.refreshToken.findUniqueOrThrow({
        where: { token: refreshToken },
      });

      await this.prismaService.refreshToken.delete({
        where: { token: refreshToken },
      });

      return { message: 'Logged out successfully' };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
        throw new UnauthorizedException('Refresh token has been revoked');
      }
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
