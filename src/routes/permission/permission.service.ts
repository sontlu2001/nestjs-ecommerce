import { PermissionRepository } from './permission.repo';
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model';
import { PermissionAlreadyExistsError, PermissionNotFoundError } from './permission.error';
import { isNotFoundPrismaError, isUniqueConstraintError } from 'src/shared/exception/prisma.exception';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionService {
  constructor(private permissionRepo: PermissionRepository) {}

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      return await this.permissionRepo.create({ data, createdById });
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        throw PermissionAlreadyExistsError;
      }
      throw error;
    }
  }

  async findMany(pagination: GetPermissionsQueryType) {
    return await this.permissionRepo.findMany(pagination);
  }

  findOne(id: number) {
    const data = this.permissionRepo.findById(id);
    if (!data) {
      throw PermissionNotFoundError;
    }
    return data;
  }

  async update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number | null }) {
    try {
      return await this.permissionRepo.update({ id, data, updatedById });
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundError;
      }
      if (isUniqueConstraintError(error)) {
        throw PermissionAlreadyExistsError;
      }
      throw error;
    }
  }

  async remove({ id, userId }: { id: number; userId: number }) {
    try {
      await this.permissionRepo.delete({ id, userId });
      return { message: 'Permission deleted successfully' };
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundError;
      }
      throw error;
    }
  }
}
