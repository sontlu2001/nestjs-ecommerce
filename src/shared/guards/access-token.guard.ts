import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { TokenService } from '../services/token.service';
import { REQUEST_USER_KEY } from '../constants/auth.contant';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const accessToken = request.headers['authorization']?.split(' ')[1];
    console.log(accessToken, 'accessToken');

    if (!accessToken) {
      return false;
    }

    try {
      const decodeAccessToken = await this.tokenService.verifyAccessToken(accessToken);
      request[REQUEST_USER_KEY] = decodeAccessToken;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired access token');
    }
  }
}
