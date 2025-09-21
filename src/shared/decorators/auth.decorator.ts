import { SetMetadata } from '@nestjs/common';
import { AuthTypeKey, ConditionGuard, ConditionGuardKey } from '../constants/auth.contant';

export const AUTH_TYPE_KEY = 'authTypes';
export type AuthTypeDecoratorPayload = {
  authTypes: AuthTypeKey[];
  option: { condition: ConditionGuardKey };
};

export const Auth = (authTypes: AuthTypeKey[], option?: { condition: ConditionGuardKey } | undefined) => {
  return SetMetadata(AUTH_TYPE_KEY, {
    authTypes,
    option: option ?? { condition: ConditionGuard.AND },
  });
};
