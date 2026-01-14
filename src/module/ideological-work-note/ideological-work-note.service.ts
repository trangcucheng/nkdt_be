import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateIdeologicalWorkNoteDto } from './dto/create-ideological-work-note.dto';
import { UpdateIdeologicalWorkNoteDto } from './dto/update-ideological-work-note.dto';
import { GetIdeologicalWorkNotesQueryDto } from './dto/get-ideological-work-notes-query.dto';

@Injectable()
export class IdeologicalWorkNoteService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo ghi chú công tác tư tưởng mới
   */
  async create(managerId: string, createDto: CreateIdeologicalWorkNoteDto) {
    // Lấy thông tin user để validate
    const manager = await this.prisma.user.findUnique({
      where: { id: managerId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!manager) {
      throw new NotFoundException('Không tìm thấy thông tin quản lý');
    }

    // Kiểm tra quyền
    const permissions = manager.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    if (!permissions.includes('CREATE_IDEOLOGICAL_WORK_NOTE')) {
      throw new ForbiddenException('Không có quyền tạo ghi chú công tác tư tưởng');
    }

    // Xác định unitId
    let unitId = createDto.unitId || manager.unitId;

    // Nếu có unitId, kiểm tra quyền truy cập đơn vị
    if (unitId) {
      const hasAccessToUnit = await this.checkUnitAccess(manager, unitId);
      if (!hasAccessToUnit) {
        throw new ForbiddenException('Không có quyền tạo ghi chú cho đơn vị này');
      }
    }

    const workNote = await this.prisma.ideologicalWorkNote.create({
      data: {
        managerId,
        unitId,
        title: createDto.title,
        content: createDto.content,
        activities: createDto.activities,
        effectEvaluation: createDto.effectEvaluation,
        targetAudience: createDto.targetAudience,
        period: createDto.period,
      },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return workNote;
  }

  /**
   * Lấy danh sách ghi chú công tác tư tưởng
   */
  async findAll(userId: string, query: GetIdeologicalWorkNotesQueryDto) {
    const { page = 1, limit = 10, unitId, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    // Lấy thông tin user để xác định quyền
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const permissions = user?.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ) || [];

    const where: any = {};

    // Phân quyền xem dữ liệu
    if (permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      // Super admin có thể xem tất cả
    } else if (permissions.includes('VIEW_IDEOLOGICAL_WORK_NOTES')) {
      // Manager chỉ xem của đơn vị mình và đơn vị con
      if (user?.unitId) {
        const allowedUnits = await this.getAllowedUnits(user.unitId);
        where.OR = [
          { managerId: userId }, // Ghi chú do mình tạo
          { unitId: { in: allowedUnits } } // Ghi chú của đơn vị mình quản lý
        ];
      } else {
        where.managerId = userId; // Chỉ xem ghi chú do mình tạo
      }
    } else {
      where.managerId = userId; // Mặc định chỉ xem ghi chú do mình tạo
    }

    // Filter theo unitId nếu có
    if (unitId) {
      where.unitId = unitId;
    }

    // Filter theo thời gian
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDateTime;
      }
    }

    const [workNotes, total] = await Promise.all([
      this.prisma.ideologicalWorkNote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          manager: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          unit: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.ideologicalWorkNote.count({ where }),
    ]);

    return {
      data: workNotes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết một ghi chú công tác
   */
  async findOne(id: string, userId: string) {
    const workNote = await this.prisma.ideologicalWorkNote.findUnique({
      where: { id },
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    if (!workNote) {
      throw new NotFoundException('Không tìm thấy ghi chú công tác tư tưởng');
    }

    // Kiểm tra quyền truy cập
    const hasAccess = await this.checkAccessToWorkNote(userId, workNote);
    if (!hasAccess) {
      throw new ForbiddenException('Không có quyền xem ghi chú này');
    }

    return workNote;
  }

  /**
   * Cập nhật ghi chú công tác
   */
  async update(id: string, userId: string, updateDto: UpdateIdeologicalWorkNoteDto) {
    const workNote = await this.prisma.ideologicalWorkNote.findUnique({
      where: { id },
    });

    if (!workNote) {
      throw new NotFoundException('Không tìm thấy ghi chú công tác tư tưởng');
    }

    // Kiểm tra quyền chỉnh sửa
    const canEdit = await this.checkEditPermission(userId, workNote);
    if (!canEdit) {
      throw new ForbiddenException('Không có quyền chỉnh sửa ghi chú này');
    }

    const updatedWorkNote = await this.prisma.ideologicalWorkNote.update({
      where: { id },
      data: updateDto,
      include: {
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        unit: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    });

    return updatedWorkNote;
  }

  /**
   * Xóa ghi chú công tác
   */
  async remove(id: string, userId: string) {
    const workNote = await this.prisma.ideologicalWorkNote.findUnique({
      where: { id },
    });

    if (!workNote) {
      throw new NotFoundException('Không tìm thấy ghi chú công tác tư tưởng');
    }

    // Kiểm tra quyền xóa
    const canDelete = await this.checkDeletePermission(userId, workNote);
    if (!canDelete) {
      throw new ForbiddenException('Không có quyền xóa ghi chú này');
    }

    await this.prisma.ideologicalWorkNote.delete({
      where: { id },
    });

    return { message: 'Đã xóa ghi chú công tác tư tưởng thành công' };
  }

  /**
   * Thống kê ghi chú công tác theo đơn vị
   */
  async getStatistics(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const permissions = user?.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ) || [];

    const where: any = {};

    if (!permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      // Giới hạn theo quyền của user
      if (user?.unitId) {
        const allowedUnits = await this.getAllowedUnits(user.unitId);
        where.OR = [
          { managerId: userId },
          { unitId: { in: allowedUnits } }
        ];
      } else {
        where.managerId = userId;
      }
    }

    const [totalCount, recentCount, unitStats] = await Promise.all([
      this.prisma.ideologicalWorkNote.count({ where }),
      this.prisma.ideologicalWorkNote.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
          }
        }
      }),
      this.prisma.ideologicalWorkNote.groupBy({
        by: ['unitId'],
        where,
        _count: {
          unitId: true
        },
        orderBy: {
          _count: {
            unitId: 'desc'
          }
        },
        take: 10
      })
    ]);

    return {
      totalCount,
      recentCount,
      unitStats
    };
  }

  // Helper methods
  private async checkUnitAccess(user: any, unitId: number): Promise<boolean> {
    const permissions = user.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    if (permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      return true;
    }

    if (user.unitId) {
      const allowedUnits = await this.getAllowedUnits(user.unitId);
      return allowedUnits.includes(unitId);
    }

    return false;
  }

  private async getAllowedUnits(userUnitId: number): Promise<number[]> {
    const unit = await this.prisma.unit.findUnique({
      where: { id: userUnitId },
      include: {
        children: true
      }
    });

    if (!unit) return [userUnitId];

    return [unit.id, ...unit.children.map(child => child.id)];
  }

  private async checkAccessToWorkNote(userId: string, workNote: any): Promise<boolean> {
    // Nếu là tác giả thì có quyền xem
    if (workNote.managerId === userId) {
      return true;
    }

    // Kiểm tra quyền theo role
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const permissions = user?.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ) || [];

    if (permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      return true;
    }

    if (permissions.includes('VIEW_IDEOLOGICAL_WORK_NOTES') && user?.unitId) {
      const allowedUnits = await this.getAllowedUnits(user.unitId);
      return allowedUnits.includes(workNote.unitId);
    }

    return false;
  }

  private async checkEditPermission(userId: string, workNote: any): Promise<boolean> {
    // Tác giả có thể chỉnh sửa
    if (workNote.managerId === userId) {
      return true;
    }

    // Super admin có thể chỉnh sửa
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const permissions = user?.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ) || [];

    return permissions.includes('UPDATE_IDEOLOGICAL_WORK_NOTE') && 
           permissions.includes('VIEW_ALL_UNITS_ANALYTICS');
  }

  private async checkDeletePermission(userId: string, workNote: any): Promise<boolean> {
    // Tác giả có thể xóa
    if (workNote.managerId === userId) {
      return true;
    }

    // Super admin có thể xóa
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true
                  }
                }
              }
            }
          }
        }
      }
    });

    const permissions = user?.userRoles.flatMap(ur => 
      ur.role.rolePermissions.map(rp => rp.permission.name)
    ) || [];

    return permissions.includes('DELETE_IDEOLOGICAL_WORK_NOTE') && 
           permissions.includes('VIEW_ALL_UNITS_ANALYTICS');
  }
}