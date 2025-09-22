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
}
