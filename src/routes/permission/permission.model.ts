import { HTTTPMethod } from 'src/shared/constants/role.constant';
import z from 'zod';

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string().max(50),
  description: z.string(),
  path: z.string().max(100),
  method: z.enum([
    HTTTPMethod.GET,
    HTTTPMethod.POST,
    HTTTPMethod.PUT,
    HTTTPMethod.PATCH,
    HTTTPMethod.DELETE,
    HTTTPMethod.HEAD,
    HTTTPMethod.OPTIONS,
  ]),

  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPermissionsResSchema = z.object({
  data: z.array(PermissionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export const GetPermissionsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1), // coerce convert to number, must be positive integer
    limit: z.coerce.number().int().positive().default(10),
  })
  .strict();

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
  })
  .strict();

export const GetPermissionDetailResSchema = PermissionSchema;

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  description: true,
}).strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema;

export type PermissionType = z.infer<typeof PermissionSchema>;
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>;
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>;
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;
export type GetPermissionDetailResType = z.infer<typeof GetPermissionDetailResSchema>;
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;
