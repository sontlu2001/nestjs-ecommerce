import { createZodDto } from 'nestjs-zod';
import {
  GetPermissionsResSchema,
  GetPermissionsQuerySchema,
  GetPermissionParamsSchema,
  GetPermissionDetailResSchema,
  CreatePermissionBodySchema,
  UpdatePermissionBodySchema,
} from './permission.model';

export class GetPermissionsResDTO extends createZodDto(GetPermissionsResSchema) {}
export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}
export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}
export class CreatePermissionDTO extends createZodDto(CreatePermissionBodySchema) {}
export class UpdatePermissionDTO extends createZodDto(UpdatePermissionBodySchema) {}
