import { createParamDecorator, ExecutionContext, Logger } from '@nestjs/common';
import { REQUEST_USER_KEY } from '../constants/auth.contant';
import { AccessTokenDecoded } from '../types/jwt.type';

export const ActiveUser = createParamDecorator((field: keyof AccessTokenDecoded, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const user: undefined = request[REQUEST_USER_KEY];
  Logger.debug('uri called, user:', user);
  return field ? user?.[field] : user;
});
