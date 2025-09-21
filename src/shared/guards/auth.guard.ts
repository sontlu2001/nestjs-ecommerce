import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Auth, AUTH_TYPE_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator';
import { AccessTokenGuard } from './access-token.guard';
import { APIkeyGuard } from './api-key.guard';
import { AuthType, ConditionGuard } from '../constants/auth.contant';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate> = {};

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: APIkeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AuthType.Bearer]: this.accessTokenGuard,
      [AuthType.ApiKey]: this.apiKeyGuard,
      [AuthType.None]: { canActivate: () => true },
    };
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeValue = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? {
      authTypes: [AuthType.None],
      option: { condition: ConditionGuard.AND },
    };

    const results = await Promise.all(
      authTypeValue.authTypes.map(async (authType) => {
        const guard = this.authTypeGuardMap[authType];
        try {
          return await guard.canActivate(context);
        } catch {
          return false; // nếu guard throw lỗi thì coi như fail, không ngắt luồng
        }
      }),
    );

    switch (authTypeValue.option.condition) {
      case ConditionGuard.AND:
        return results.every(Boolean);
      case ConditionGuard.OR:
        return results.some(Boolean);
      default:
        return true;
    }
  }
}
