import { Injectable, Get } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType,
} from './permission.model';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findMany(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;
    const [data, totalItems] = await Promise.all([
      this.prismaService.permission.findMany({
        skip,
        take: limit,
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);
    return {
      data,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    };
  }

  async findById(id: number): Promise<PermissionType | null> {
    return await this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number | null;
    data: CreatePermissionBodyType;
  }): Promise<PermissionType> {
    return await this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    });
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number;
    updatedById: number | null;
    data: UpdatePermissionBodyType;
  }): Promise<PermissionType> {
    return await this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    });
  }

  async delete({ id, userId }: { id: number; userId: number }): Promise<PermissionType> {
    return await this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
        updatedById: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
