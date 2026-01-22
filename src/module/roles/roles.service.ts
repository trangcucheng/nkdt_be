import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateRoleDTO } from './dto/create-role.dto';
import { UpdateRoleDTO } from './dto/update-role.dto';
import { Prisma, Role } from '@prisma/client';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async createRole(createRoleDTO: CreateRoleDTO) {
    const { name, description, permissionIds } = createRoleDTO;

    return await this.prisma.role.create({
      data: {
        name,
        description,
        rolePermissions: {
          create: permissionIds.map((pid) => ({
            permission: { connect: { id: pid } },
          })),
        },
      },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  async updateRole(id: string, dto: UpdateRoleDTO) {
    const role = await this.prisma.role.findUnique({ where: { id } });
    if (!role) throw new NotFoundException('Role not found');

    // Xóa hết permission cũ
    await this.prisma.rolePermission.deleteMany({
      where: { roleId: id },
    });

    // Cập nhật role + permission mới
    return await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        rolePermissions: {
          create: (dto.permissionIds ?? []).map((pid) => ({
            permission: { connect: { id: pid } },
          })),
        },
      },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }

  // async getAllRoles() {
  //   return await this.prisma.role.findMany({
  //     include: {
  //       rolePermissions: { include: { permission: true } },
  //     },
  //   });
  // }

  async getAllRoles(
    params: {
      page?: number;
      pageSize?: number;
      where?: Prisma.RoleWhereInput;
      orderBy?: Prisma.RoleOrderByWithRelationInput;
    } = {},
  ): Promise<Role[]> {
    const { page = 1, pageSize = 10, where, orderBy } = params;
    const skip = (page - 1) * pageSize;
    const take = pageSize;
    // findMany không hỗ trợ phân trang trực tiếp, nên ta sẽ sử dụng skip và take (tức là không dùng được page và pageSize)
    return await this.prisma.role.findMany({
      skip,
      take,
      where,
      orderBy,
      include: {
        rolePermissions: { include: { permission: true } },
      },
    });
  }

  async deleteRole(id: string) {
    return await this.prisma.role.delete({ where: { id } });
  }

  async getRoleById(id: string): Promise<Role | null> {
    return await this.prisma.role.findUnique({
      where: { id },
      include: { rolePermissions: { include: { permission: true } } },
    });
  }
}
