import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { DeviceType, RefreshTokenType, RegisterReqType, RoleType, UserType, VerificationCodeType } from './auth.model';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.contant';

@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterReqType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    });
  }

  async createVerificationCode(payload: Omit<VerificationCodeType, 'id' | 'createdAt'>): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: {
        email: payload.email,
      },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    });
  }

  async findVerificationCode(
    uniqueValue:
      | { email: string }
      | { id: number }
      | {
          email: string;
          code: string;
          type: TypeOfVerificationCode;
        },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    });
  }

  async createRefreshToken(data: { token: string; userId: number; expiresAt: Date; deviceId: number }): Promise<void> {
    Logger.log('Creating refresh token with data: ' + JSON.stringify(data));
    await this.prismaService.refreshToken.create({
      data,
    });
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ipAddress'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ): Promise<DeviceType> {
    return await this.prismaService.device.create({
      data,
    });
  }

  async findUniqueUserIncludeRole(uniqueObj: { email: string }): Promise<(UserType & { role: RoleType }) | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueObj,
      include: {
        role: true,
      },
    });
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueObj: {
    token: string;
  }): Promise<RefreshTokenType & { user: UserType & { role: RoleType } }> {
    return await this.prismaService.refreshToken.findUniqueOrThrow({
      where: uniqueObj,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async updateDeviceLastActive(deviceId: number, data: Partial<DeviceType>): Promise<DeviceType> {
    return await this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    });
  }

  async deleteRefreshTokenById(uniqueObj: { token: string }): Promise<RefreshTokenType> {
    return await this.prismaService.refreshToken.delete({
      where: uniqueObj,
    });
  }
}
