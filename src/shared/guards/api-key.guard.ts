import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constants/auth.contant';

@Injectable()
export class APIkeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const xAPIkey = request.headers['x-api-key'];

    if (!xAPIkey || xAPIkey !== process.env.SECRET_API_KEY) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
