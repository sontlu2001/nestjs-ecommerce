import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../types/jwt.type';
import { PrismaService } from './prisma.service';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  signAccessToken(payload: { userId: number }) {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
      algorithm: 'HS256',
    });
  }

  signRefreshToken(payload: { userId: number }) {
    return this.jwtService.signAsync(payload, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
      algorithm: 'HS256',
    });
  }

  verifyAccessToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }

  verifyRefreshToken(token: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }

  async generateTokens(payload: { userId: number }) {
    {
      const [accessToken, refreshToken] = await Promise.all([
        this.signAccessToken(payload),
        this.signRefreshToken(payload),
      ]);

      const decodeRefreshToken = await this.verifyRefreshToken(refreshToken);
      await this.prismaService.refreshToken.create({
        data: {
          token: refreshToken,
          userId: payload.userId,
          expiresAt: new Date(decodeRefreshToken.exp * 1000),
        },
      });

      return { accessToken, refreshToken };
    }
  }
}
