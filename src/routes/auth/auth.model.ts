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

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([VerificationCode.REGISTER, VerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
});

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict();

export const LoginBodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(6).max(100),
    userAgent: z.string().optional(),
    ipAddress: z.string().optional(),
  })
  .strict();

export const LoginResSchema = z
  .object({
    accessToken: z.string(),
    refreshToken: z.string(),
  })
  .strict();

export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict();
export const RefreshTokenResSchema = LoginResSchema;

export const DeviceShema = z
  .object({
    id: z.number(),
    userId: z.number(),
    userAgent: z.string(),
    ipAddress: z.string(),
    lastActive: z.date(),
    createdAt: z.date(),
    isActive: z.boolean(),
  })
  .strict();

export const RoleShema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    isActive: z.boolean(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    deletedAt: z.date().nullable(),
  })
  .strict();

export const RefreshTokenSchema = z
  .object({
    token: z.string(),
    userId: z.number(),
    deviceId: z.number(),
    expiresAt: z.date(),
    createdAt: z.date(),
  })
  .strict();

export type UserType = z.infer<typeof UserSchema>;
export type RegisterReqType = z.infer<typeof RegisterReqSchema>;
export type RegisterResType = z.infer<typeof RegisterResSchema>;
export type RoleType = z.infer<typeof RoleShema>;
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>;
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;
export type LoginReqType = z.infer<typeof LoginBodySchema>;
export type LoginResType = z.infer<typeof LoginResSchema>;
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>;
export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>;
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>;
export type DeviceType = z.infer<typeof DeviceShema>;
