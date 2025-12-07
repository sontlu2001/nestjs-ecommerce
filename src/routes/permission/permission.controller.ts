import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Put } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { ZodSerializerDto } from 'nestjs-zod';
import {
  CreatePermissionDTO,
  GetPermissionDetailResDTO,
  GetPermissionParamsDTO,
  GetPermissionsQueryDTO,
  GetPermissionsResDTO,
  UpdatePermissionDTO,
} from './permission.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  @ZodSerializerDto(GetPermissionDetailResDTO)
  create(@Body() body: CreatePermissionDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.create({ data: body, createdById: userId });
  }

  @Get()
  @ZodSerializerDto(GetPermissionsResDTO)
  findMany(@Query() query: GetPermissionsQueryDTO) {
    return this.permissionService.findMany({
      page: query.page,
      limit: query.limit,
    });
  }

  @Get(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  findOne(@Param() params: GetPermissionParamsDTO) {
    return this.permissionService.findOne(params.permissionId);
  }

  @Put(':permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  update(
    @Param() params: GetPermissionParamsDTO,
    @Body() updatePermissionDto: UpdatePermissionDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.permissionService.update({
      id: params.permissionId,
      data: updatePermissionDto,
      updatedById: userId,
    });
  }

  @Delete(':permissionId')
  remove(@Param() params: GetPermissionParamsDTO, @ActiveUser('userId') userId: number) {
    return this.permissionService.remove({ id: params.permissionId, userId: userId });
  }
}
