import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const UserShema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
});

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email(),
  phoneNumber: z.string(),
  avatar: z.string().nullable().optional(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  createdById: z.number().nullable().optional(),
  updatedById: z.number().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
});
export const RegisterSchema = z
  .object({
    name: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string().min(6).max(100),
    phoneNumber: z.string().min(10).max(15).optional(),
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

export class RegisterDTO extends createZodDto(RegisterSchema) {}
export class RegisterResponseDTO extends createZodDto(UserShema) {}
