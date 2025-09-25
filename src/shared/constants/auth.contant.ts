export const REQUEST_USER_KEY = 'user';

export const AuthType = {
  Bearer: 'Bearer',
  None: 'None',
  ApiKey: 'ApiKey',
} as const;
export type AuthTypeKey = keyof typeof AuthType;

export const ConditionGuard = {
  AND: 'AND',
  OR: 'OR',
} as const;
export type ConditionGuardKey = keyof typeof ConditionGuard;

export const UserStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  BLOCKED: 'BLOCKED',
} as const;
