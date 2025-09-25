import { UserStatus } from 'src/shared/constants/auth.contant';
import z from 'zod';

const UserShema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  phoneNumber: z.string().min(10).max(15),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum(UserStatus),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  deletedAt: z.date().nullable(),
});

export const RegisterReqSchema = UserShema.pick({
  name: true,
  email: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
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

export const RegisterResSchema = UserShema.omit({
  password: true,
  totpSecret: true,
});

export type UserType = z.infer<typeof UserShema>;
export type RegisterReqType = z.infer<typeof RegisterReqSchema>;
export type RegisterResType = z.infer<typeof RegisterResSchema>;
