import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetAllRolesDTO } from './dto/pagination.dto';
import { Prisma, Role_ } from '@prisma/client';
import { RolesGuard } from 'src/guard/roles.guard';
import { Permissions } from 'src/decorator/permissions.decorator';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('roles')
export class RolesController {
  constructor(private roleService: RolesService) {}

  @Get('/list-all-role')
  @Permissions('VIEW_ROLE')
  async getAllRoles(@Query() query: GetAllRolesDTO): Promise<Role_[]> {
    const { page = '1', pageSize = '10', orderBy } = query;

    // Xử lý orderBy string (vd: 'createdAt:desc')
    let orderByObj: Prisma.Role_OrderByWithRelationInput | undefined;
    if (orderBy) {
      orderByObj = {
        createdAt: orderBy === 'createdAt:desc' ? 'desc' : 'asc',
      };
    }

    return this.roleService.getAllRoles({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
    });
  }

  @Post('/create-role')
  @Permissions('CREATE_ROLE')
  async create(@Body() createRoleDTO: CreateRoleDTO) {
    return this.roleService.createRole(createRoleDTO);
  }

  @Put('/update-role')
  @Permissions('UPDATE_ROLE')
  async update(@Param('roleId') roleId: string, @Body() dto: UpdateRoleDTO) {
    return this.roleService.updateRole(roleId, dto);
  }

  @Delete('/delete-role')
  @Permissions('DELETE_ROLE')
  async delete(@Param('roleId') roleId: string) {
    return this.roleService.deleteRole(roleId);
  }

  @Get('/detail-role')
  async getRoleById(@Param('roleId') roleId: string): Promise<Role_ | null> {
    const role = await this.roleService.getRoleById(roleId);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }
}
