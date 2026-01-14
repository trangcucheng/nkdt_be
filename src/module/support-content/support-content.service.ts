import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateSupportContentDto } from './dto/create-support-content.dto';
import { UpdateSupportContentDto } from './dto/update-support-content.dto';
import { GetSupportContentQueryDto } from './dto/get-support-content-query.dto';

@Injectable()
export class SupportContentService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo nội dung hỗ trợ mới (chỉ admin)
   */
  async create(userId: string, createSupportContentDto: CreateSupportContentDto) {
    return await this.prisma.supportContent.create({
      data: {
        ...createSupportContentDto,
        createdBy: userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Lấy danh sách nội dung hỗ trợ (cho user thường)
   */
  async findAllForUsers(query: GetSupportContentQueryDto) {
    const { category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    const [contents, total] = await Promise.all([
      this.prisma.supportContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { createdAt: 'desc' },
          { viewCount: 'desc' }
        ],
        select: {
          id: true,
          title: true,
          content: true,
          category: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.supportContent.count({ where }),
    ]);

    return {
      data: contents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy danh sách nội dung hỗ trợ (cho admin - bao gồm inactive)
   */
  async findAllForAdmin(query: GetSupportContentQueryDto) {
    const { category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (category) {
      where.category = category;
    }

    const [contents, total] = await Promise.all([
      this.prisma.supportContent.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.supportContent.count({ where }),
    ]);

    return {
      data: contents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết một nội dung hỗ trợ
   */
  async findOne(id: string, isUser: boolean = true) {
    const supportContent = await this.prisma.supportContent.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!supportContent) {
      throw new NotFoundException('Không tìm thấy nội dung hỗ trợ');
    }

    // Nếu là user thường, chỉ có thể xem content active
    if (isUser && !supportContent.isActive) {
      throw new NotFoundException('Không tìm thấy nội dung hỗ trợ');
    }

    // Tăng view count nếu là user thường đang đọc
    if (isUser) {
      await this.prisma.supportContent.update({
        where: { id },
        data: {
          viewCount: {
            increment: 1,
          },
        },
      });
      supportContent.viewCount += 1;
    }

    return supportContent;
  }

  /**
   * Cập nhật nội dung hỗ trợ (chỉ admin hoặc creator)
   */
  async update(id: string, userId: string, updateSupportContentDto: UpdateSupportContentDto, isAdmin: boolean = false) {
    const supportContent = await this.prisma.supportContent.findUnique({
      where: { id },
    });

    if (!supportContent) {
      throw new NotFoundException('Không tìm thấy nội dung hỗ trợ');
    }

    // Chỉ creator hoặc admin mới có thể chỉnh sửa
    if (!isAdmin && supportContent.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền chỉnh sửa nội dung này');
    }

    return await this.prisma.supportContent.update({
      where: { id },
      data: updateSupportContentDto,
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  /**
   * Xóa nội dung hỗ trợ (chỉ admin hoặc creator)
   */
  async remove(id: string, userId: string, isAdmin: boolean = false) {
    const supportContent = await this.prisma.supportContent.findUnique({
      where: { id },
    });

    if (!supportContent) {
      throw new NotFoundException('Không tìm thấy nội dung hỗ trợ');
    }

    // Chỉ creator hoặc admin mới có thể xóa
    if (!isAdmin && supportContent.createdBy !== userId) {
      throw new ForbiddenException('Bạn không có quyền xóa nội dung này');
    }

    await this.prisma.supportContent.delete({
      where: { id },
    });

    return { message: 'Đã xóa nội dung hỗ trợ thành công' };
  }

  /**
   * Lấy thống kê nội dung hỗ trợ (cho admin)
   */
  async getStatistics() {
    const [total, activeCount, categoryStats, topViewed] = await Promise.all([
      this.prisma.supportContent.count(),
      this.prisma.supportContent.count({ where: { isActive: true } }),
      this.prisma.supportContent.groupBy({
        by: ['category'],
        _count: {
          category: true,
        },
        orderBy: {
          _count: {
            category: 'desc',
          },
        },
      }),
      this.prisma.supportContent.findMany({
        where: { isActive: true },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          title: true,
          category: true,
          viewCount: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      total,
      activeCount,
      inactiveCount: total - activeCount,
      categoryBreakdown: categoryStats,
      topViewedContents: topViewed,
    };
  }
}