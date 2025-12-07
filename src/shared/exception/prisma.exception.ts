import { Prisma } from '@prisma/client';

export function isNotFoundPrismaError(error: any): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025';
}

export function isUniqueConstraintError(error: any): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002';
}
