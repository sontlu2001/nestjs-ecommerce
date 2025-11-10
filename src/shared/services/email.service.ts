import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  sendOTP(payload: { to: string; code: string }) {
    return this.resend.emails.send({
      from: 'Meta shop <no-reply@metashop.fun>',
      to: payload.to,
      subject: 'Your OTP Code',
      html: `<strong>Your OTP code is: ${payload.code}</strong>`,
    });
  }
}
