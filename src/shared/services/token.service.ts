import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDecoded, AccessTokenPayload, RefreshTokenDecoded, RefreshTokenPayload } from '../types/jwt.type';
import { PrismaService } from './prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  signAccessToken(payload: AccessTokenPayload) {
    return this.jwtService.signAsync(
      { ...payload, id: uuidv4() },
      {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
        algorithm: 'HS256',
      },
    );
  }

  signRefreshToken(payload: RefreshTokenPayload) {
    return this.jwtService.signAsync(
      { ...payload, id: uuidv4() },
      {
        secret: process.env.JWT_REFRESH_TOKEN_SECRET,
        expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
        algorithm: 'HS256',
      },
    );
  }

  verifyAccessToken(token: string): Promise<AccessTokenDecoded> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_ACCESS_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }

  verifyRefreshToken(token: string): Promise<RefreshTokenDecoded> {
    return this.jwtService.verifyAsync(token, {
      secret: process.env.JWT_REFRESH_TOKEN_SECRET,
      algorithms: ['HS256'],
    });
  }

  async generateTokens(payload: AccessTokenPayload) {
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
          deviceId: payload.deviceId,
        },
      });

      return { accessToken, refreshToken };
    }
  }
}
