import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hasing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from './guards/access-token.guard';
import { APIkeyGuard } from './guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from './guards/auth.guard';
import { ShareUserRepository } from './repositories/share-user.repo';
import { EmailService } from './services/email.service';

const sharedServices = [
  PrismaService,
  HashingService,
  TokenService,
  AccessTokenGuard,
  APIkeyGuard,
  ShareUserRepository,
  EmailService,
];
@Global()
@Module({
  imports: [JwtModule],
  providers: [
    ...sharedServices,
    AccessTokenGuard,
    APIkeyGuard,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
  ],
  exports: sharedServices,
})
export class SharedModule {}
