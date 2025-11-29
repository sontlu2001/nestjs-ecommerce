import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from 'src/shared/services/hasing.service';
import { RolesService } from './roles.service';
import {
  ForgotPasswordBodyType,
  LoginReqType,
  LoginResType,
  RefreshTokenBodyType,
  RegisterReqType,
  SendOTPBodyType,
} from './auth.model';
import { AuthRepository } from './auth.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { generateOTP } from 'src/shared/helpers';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { VerificationCode } from 'src/shared/constants/auth.contant';
import { EmailService } from 'src/shared/services/email.service';
import { TokenService } from 'src/shared/services/token.service';
import {
  EmailAlreadyExistsError,
  EmailNotFoundError,
  ExpiredVerificationCodeError,
  InvalidEmailOrPasswordError,
  InvalidRefreshTokenError,
  InvalidVerificationCodeError,
  OTPEmailSendError,
  TOTPAlreadyEnabledException,
} from './auth.error.model';
import { TwoFactorService } from 'src/shared/services/2fa.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly twoFactorAuthService: TwoFactorService,
  ) {}

  async register(data: RegisterReqType) {
    try {
      const verificationCode = await this.authRepository.findVerificationCode({
        email_code_type: {
          email: data.email,
          code: data.code,
          type: VerificationCode.REGISTER,
        },
      });

      if (!verificationCode) {
        throw InvalidVerificationCodeError;
      }

      if (verificationCode.expiresAt < new Date()) {
        throw ExpiredVerificationCodeError;
      }

      const clientRoleId = await this.rolesService.getClientRoleId();
      const hashedPassword = await this.hashingService.hash(data.password);
      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: data.email,
          name: data.name,
          phoneNumber: data.phoneNumber,
          password: hashedPassword,
          roleId: clientRoleId,
        }),
        this.authRepository.deleteVerificationCode({
          email_code_type: {
            email: data.email,
            code: data.code,
            type: VerificationCode.REGISTER,
          },
        }),
      ]);

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw EmailAlreadyExistsError;
        }
      }
      throw error;
    }
  }

  async sendOTP(data: SendOTPBodyType) {
    const user = await this.shareUserRepository.findUserUnique({ email: data.email });

    if (data.type === VerificationCode.REGISTER && user) {
      throw EmailAlreadyExistsError;
    }

    if (data.type === VerificationCode.FORGOT_PASSWORD && !user) {
      throw EmailNotFoundError;
    }

    const otp = generateOTP();
    await this.authRepository.createVerificationCode({
      email: data.email,
      code: otp.toString(),
      type: data.type,
      expiresAt: addMilliseconds(new Date(), ms(process.env.OTP_EXPIRES_IN)),
    });

    // Send OTP via email

    const { error } = await this.emailService.sendOTP({
      to: data.email,
      code: otp.toString(),
    });

    if (error) {
      Logger.error('Failed to send OTP email', JSON.stringify(error));
      throw OTPEmailSendError;
    }

    return { message: 'OTP sent successfully' };
  }

  async login(data: LoginReqType) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: data.email });
    if (!user) {
      throw InvalidEmailOrPasswordError;
    }
    const isPasswordValid = await this.hashingService.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw InvalidEmailOrPasswordError;
    }

    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: data.userAgent || '',
      ipAddress: data.ipAddress || '',
    });

    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    });

    return tokens;
  }

  async generateTokens({
    userId,
    deviceId,
    roleId,
    roleName,
  }: {
    userId: number;
    deviceId: number;
    roleId: number;
    roleName: string;
  }): Promise<LoginResType> {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({
        userId: userId,
      }),
    ]);

    const decodeRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: userId,
      expiresAt: decodeRefreshToken.exp ? new Date(decodeRefreshToken.exp * 1000) : new Date(),
      deviceId: deviceId,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // check token is valid
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
      // check token is in db
      const storedRefreshToken = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      });

      // get user role info
      const {
        deviceId,
        user: { roleId, name: roleName },
      } = storedRefreshToken;

      // update device last active
      const $updateDevice = this.authRepository.updateDeviceLastActive(deviceId, {
        ipAddress: ip,
        userAgent: userAgent,
      });

      // delete old refresh token
      const $deleteRefreshToken = this.authRepository.deleteRefreshTokenById({ token: refreshToken });

      // generate new tokens
      const $device = this.generateTokens({ userId, deviceId, roleId, roleName });

      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $device]);
      return tokens;
    } catch (error) {
      Logger.error('Failed to refresh token: ' + error.message);
      throw InvalidRefreshTokenError;
    }
  }

  async logout(refreshToken: string) {
    try {
      await this.tokenService.verifyRefreshToken(refreshToken);
      const deletedRefreshToken = await this.authRepository.deleteRefreshTokenById({ token: refreshToken });
      await this.authRepository.updateDeviceLastActive(deletedRefreshToken.deviceId, {
        isActive: false,
      });
      return { message: 'Logged out successfully' };
    } catch (error) {
      Logger.error('Failed to verify refresh token during logout: ' + error.message);
      throw InvalidRefreshTokenError;
    }
  }

  async forgotPassword(data: ForgotPasswordBodyType) {
    const user = await this.shareUserRepository.findUserUnique({ email: data.email });
    if (!user) {
      throw EmailNotFoundError;
    }
    const verificationCode = await this.authRepository.findVerificationCode({
      email_code_type: {
        email: data.email,
        code: data.code,
        type: VerificationCode.FORGOT_PASSWORD,
      },
    });

    if (!verificationCode) {
      throw InvalidVerificationCodeError;
    }

    if (verificationCode.expiresAt < new Date()) {
      throw ExpiredVerificationCodeError;
    }

    const hashedPassword = await this.hashingService.hash(data.newPassword);
    await Promise.all([
      this.authRepository.updateUser({ email: data.email }, { password: hashedPassword }),
      this.authRepository.deleteVerificationCode({
        email_code_type: {
          email: data.email,
          code: data.code,
          type: VerificationCode.FORGOT_PASSWORD,
        },
      }),
    ]);
    return { message: 'Password reset successfully' };
  }

  async setupTwoFactorAuth(userId: number) {
    // get user info
    const user = await this.shareUserRepository.findUserUnique({ id: userId });
    if (!user) {
      throw EmailNotFoundError;
    }

    // check if TOTP is already enabled
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException;
    }

    // generate TOTP secret
    const { secret, uri } = this.twoFactorAuthService.generateTOPTSecret(user.email);
    // save TOTP secret to user
    await this.authRepository.updateUser({ id: userId }, { totpSecret: secret });

    return {
      secret,
      uri,
    };
  }
}
