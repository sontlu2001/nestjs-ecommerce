import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';
import { HashingService } from './services/hasing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';

const sharedServices = [PrismaService, HashingService, TokenService];
@Global()
@Module({
  imports: [JwtModule],
  providers: sharedServices,
  exports: sharedServices,
})
export class SharedModule {}
