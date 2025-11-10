import { VerificationCode } from 'src/shared/constants/auth.contant';
import { UserSchema } from 'src/shared/models/share-user.model';
import z from 'zod';

export const RegisterReqSchema = UserSchema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ password, confirmPassword }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      });
    }
  });

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
});

export type UserType = z.infer<typeof UserSchema>;
export type RegisterReqType = z.infer<typeof RegisterReqSchema>;
export type RegisterResType = z.infer<typeof RegisterResSchema>;

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([VerificationCode.REGISTER, VerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
});
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
