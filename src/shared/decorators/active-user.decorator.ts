import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from '../types/jwt.type';
import { REQUEST_USER_KEY } from '../constants/auth.contant';

export const ActiveUser = createParamDecorator((field: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user: JwtPayload | undefined = request[REQUEST_USER_KEY];
  return field ? user?.[field] : user;
});
