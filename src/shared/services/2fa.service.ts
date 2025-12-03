import { Injectable } from '@nestjs/common';
import * as OTPAuth from 'otpauth';
import envConfig from 'src/config';

@Injectable()
export class TwoFactorService {
  private createOTP(email: string, secret?: string) {
    return new OTPAuth.TOTP({
      issuer: envConfig.APP_NAME,
      label: email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret || new OTPAuth.Secret(),
    });
  }

  generateTOPTSecret(email: string) {
    const totp = this.createOTP(email);
    return {
      secret: totp.secret.base32,
      uri: totp.toString(),
    };
  }

  verifyTOPT({ email, token, secret }: { email: string; token: string; secret: string }): boolean {
    const totp = this.createOTP(email, secret);
    const delta = totp.validate({ token, window: 1 });
    return delta !== null;
  }
}
