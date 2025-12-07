import { ConflictException, NotFoundException } from '@nestjs/common';

export const PermissionNotFoundError = new NotFoundException('Error.PermissionNotFound');
export const PermissionAlreadyExistsError = new ConflictException('Error.PermissionAlreadyExists');
