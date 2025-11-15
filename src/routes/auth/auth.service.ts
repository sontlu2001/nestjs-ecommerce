import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HashingService } from 'src/shared/services/hasing.service';
import { RolesService } from './roles.service';
import { LoginReqType, LoginResType, RegisterReqType, SendOTPBodyType } from './auth.model';
import { AuthRepository } from './auth.repo';
import { ShareUserRepository } from 'src/shared/repositories/share-user.repo';
import { generateOTP } from 'src/shared/helpers';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { VerificationCode } from 'src/shared/constants/auth.contant';
import { EmailService } from 'src/shared/services/email.service';
import { TokenService } from 'src/shared/services/token.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly rolesService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}

  async register(data: RegisterReqType) {
    try {
      const verificationCode = await this.authRepository.findVerificationCode({
        email: data.email,
        code: data.code,
        type: VerificationCode.REGISTER,
      });

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            message: 'Invalid verification code',
            path: 'code',
          },
        ]);
      }

      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            message: 'Verification code has expired',
            path: 'code',
          },
        ]);
      }

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

  async sendOTP(data: SendOTPBodyType) {
    const user = await this.shareUserRepository.findUserUnique({ email: data.email });
    console.log(user);
    if (user) {
      throw new ConflictException('Email already exists');
    }

    const otp = generateOTP();
    const newVerificationCode = await this.authRepository.createVerificationCode({
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
      throw new UnprocessableEntityException([
        {
          message: 'Failed to send OTP email',
          path: 'email',
        },
      ]);
    }

    return newVerificationCode;
  }

  async login(data: LoginReqType) {
    const user = await this.authRepository.findUniqueUserIncludeRole({ email: data.email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const isPasswordValid = await this.hashingService.compare(data.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
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
      deviceId: deviceId || undefined,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
