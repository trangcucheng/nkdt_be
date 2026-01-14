import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { CreateDiaryDto } from './dto/create-diary.dto';
import { UpdateDiaryDto } from './dto/update-diary.dto';
import { GetDiariesQueryDto } from './dto/get-diaries-query.dto';
import { CreateDiaryReactionDto } from './dto/create-diary-reaction.dto';
import { CreateCommentDto, UpdateCommentDto } from './dto/comment.dto';
import { PrivacyLevel } from '@prisma/client';
import { getPromptOfTheDay, getRandomPrompt, getPromptsByCategory } from './constants/guided-prompts';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tạo nhật ký mới
   */
  async create(userId: string, createDiaryDto: CreateDiaryDto) {
    const { content, emotionStatus, privacyLevel, hashtags, date, isGuided, guidedPrompt, isQuickWrite } = createDiaryDto;
    
    // Xác định ngày của nhật ký
    const diaryDate = date ? new Date(date) : new Date();
    diaryDate.setHours(0, 0, 0, 0); // Reset time to beginning of day

    const diary = await this.prisma.diary.create({
      data: {
        userId,
        content,
        emotionStatus,
        privacyLevel: privacyLevel || PrivacyLevel.PRIVATE,
        hashtags: hashtags || [],
        date: diaryDate,
        isGuided: isGuided || false,
        guidedPrompt: guidedPrompt || null,
        isQuickWrite: isQuickWrite || false,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return diary;
  }

  /**
   * Lấy danh sách nhật ký của user hiện tại
   */
  async findUserDiaries(userId: string, query: GetDiariesQueryDto) {
    const { page = 1, limit = 10, emotionStatus, privacyLevel, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };

    if (emotionStatus) {
      where.emotionStatus = emotionStatus;
    }

    if (privacyLevel) {
      where.privacyLevel = privacyLevel;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateTime;
      }
    }

    const [diaries, total] = await Promise.all([
      this.prisma.diary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.diary.count({ where }),
    ]);

    return {
      data: diaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy nhật ký được chia sẻ ẩn danh (cho mục "Không gian sẻ chia")
   */
  async findAnonymousSharedDiaries(query: GetDiariesQueryDto) {
    const { page = 1, limit = 10, emotionStatus, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      privacyLevel: PrivacyLevel.ANONYMOUS_SHARE,
    };

    if (emotionStatus) {
      where.emotionStatus = emotionStatus;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateTime;
      }
    }

    const [diaries, total] = await Promise.all([
      this.prisma.diary.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          content: true,
          emotionStatus: true,
          hashtags: true,
          date: true,
          createdAt: true,
          reactions: {
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.diary.count({ where }),
    ]);

    return {
      data: diaries,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết một nhật ký
   */
  async findOne(id: string, userId: string) {
    const diary = await this.prisma.diary.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (!diary) {
      throw new NotFoundException('Không tìm thấy nhật ký');
    }

    // Kiểm tra quyền truy cập
    if (diary.userId !== userId && diary.privacyLevel === PrivacyLevel.PRIVATE) {
      throw new ForbiddenException('Bạn không có quyền xem nhật ký này');
    }

    // Nếu là nhật ký ẩn danh và không phải của user hiện tại, ẩn thông tin user
    if (diary.privacyLevel === PrivacyLevel.ANONYMOUS_SHARE && diary.userId !== userId) {
      return {
        ...diary,
        user: undefined,
      };
    }

    return diary;
  }

  /**
   * Cập nhật nhật ký
   */
  async update(id: string, userId: string, updateDiaryDto: UpdateDiaryDto) {
    const diary = await this.prisma.diary.findUnique({
      where: { id },
    });

    if (!diary) {
      throw new NotFoundException('Không tìm thấy nhật ký');
    }

    if (diary.userId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể chỉnh sửa nhật ký của chính mình');
    }

    const updatedDiary = await this.prisma.diary.update({
      where: { id },
      data: updateDiaryDto,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return updatedDiary;
  }

  /**
   * Xóa nhật ký
   */
  async remove(id: string, userId: string) {
    const diary = await this.prisma.diary.findUnique({
      where: { id },
    });

    if (!diary) {
      throw new NotFoundException('Không tìm thấy nhật ký');
    }

    if (diary.userId !== userId) {
      throw new ForbiddenException('Bạn chỉ có thể xóa nhật ký của chính mình');
    }

    await this.prisma.diary.delete({
      where: { id },
    });

    return { message: 'Đã xóa nhật ký thành công' };
  }

  /**
   * Lấy danh sách phản ứng của nhật ký
   */
  async getReactions(diaryId: string) {
    const reactions = await this.prisma.diaryReaction.findMany({
      where: { diaryId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group reactions by type and count
    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.reactionType] = (acc[reaction.reactionType] || 0) + 1;
      return acc;
    }, {});

    return {
      reactions,
      counts: reactionCounts,
      total: reactions.length,
    };
  }

  /**
   * Thêm phản ứng cho nhật ký ẩn danh
   */
  async addReaction(diaryId: string, userId: string, createReactionDto: CreateDiaryReactionDto) {
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) {
      throw new NotFoundException('Không tìm thấy nhật ký');
    }

    if (diary.privacyLevel !== PrivacyLevel.ANONYMOUS_SHARE) {
      throw new ForbiddenException('Bạn chỉ có thể phản ứng với nhật ký được chia sẻ ẩn danh');
    }

    if (diary.userId === userId) {
      throw new ForbiddenException('Bạn không thể phản ứng với nhật ký của chính mình');
    }

    // Kiểm tra xem user đã react chưa
    const existingReaction = await this.prisma.diaryReaction.findUnique({
      where: {
        diaryId_userId: {
          diaryId,
          userId,
        },
      },
    });

    if (existingReaction) {
      // Cập nhật reaction cũ
      return await this.prisma.diaryReaction.update({
        where: { id: existingReaction.id },
        data: { reactionType: createReactionDto.reactionType },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    } else {
      // Tạo reaction mới
      return await this.prisma.diaryReaction.create({
        data: {
          diaryId,
          userId,
          reactionType: createReactionDto.reactionType,
        },
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });
    }
  }

  /**
   * Xóa phản ứng
   */
  async removeReaction(diaryId: string, userId: string) {
    const reaction = await this.prisma.diaryReaction.findUnique({
      where: {
        diaryId_userId: {
          diaryId,
          userId,
        },
      },
    });

    if (!reaction) {
      throw new NotFoundException('Không tìm thấy phản ứng');
    }

    await this.prisma.diaryReaction.delete({
      where: { id: reaction.id },
    });

    return { message: 'Đã xóa phản ứng thành công' };
  }

  /**
   * Thống kê cảm xúc cá nhân theo thời gian
   */
  async getPersonalEmotionStats(userId: string, startDate?: string, endDate?: string) {
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateTime;
      }
    }

    const emotionStats = await this.prisma.diary.groupBy({
      by: ['emotionStatus'],
      where,
      _count: {
        emotionStatus: true,
      },
      orderBy: {
        _count: {
          emotionStatus: 'desc',
        },
      },
    });

    const dailyStats = await this.prisma.diary.groupBy({
      by: ['date', 'emotionStatus'],
      where,
      _count: {
        emotionStatus: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return {
      emotionBreakdown: emotionStats,
      dailyTrends: dailyStats,
    };
  }

  /**
   * Lấy emotion timeline - danh sách nhật ký theo timeline
   */
  async getEmotionTimeline(
    userId: string,
    startDate?: string,
    endDate?: string,
    emotionStatus?: string
  ) {
    const where: any = { userId };

    // Lọc theo emotion
    if (emotionStatus) {
      where.emotionStatus = emotionStatus;
    }

    // Lọc theo date range
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const endDateTime = new Date(endDate);
        endDateTime.setHours(23, 59, 59, 999);
        where.date.lte = endDateTime;
      }
    }

    const diaries = await this.prisma.diary.findMany({
      where,
      orderBy: { date: 'desc' },
      select: {
        id: true,
        content: true,
        emotionStatus: true,
        date: true,
        createdAt: true,
        isGuided: true,
        guidedPrompt: true,
        isQuickWrite: true,
        hashtags: true,
      },
    });

    return diaries;
  }

  /**
   * Lấy câu hỏi gợi mở cho nhật ký dẫn dắt
   */
  async getGuidedPrompt(type: 'daily' | 'random' = 'daily', category?: string) {
    if (category) {
      // Lọc theo category
      const prompts = getPromptsByCategory(category as any);
      if (prompts.length === 0) {
        throw new BadRequestException('Danh mục câu hỏi không hợp lệ');
      }
      // Random từ category
      const randomIndex = Math.floor(Math.random() * prompts.length);
      return prompts[randomIndex];
    }

    if (type === 'random') {
      return getRandomPrompt();
    }

    // Default: câu hỏi của ngày
    return getPromptOfTheDay();
  }

  // ========== COMMENT METHODS ==========

  /**
   * Lấy danh sách bình luận của một nhật ký
   */
  async getComments(diaryId: string) {
    const comments = await this.prisma.diaryComment.findMany({
      where: { diaryId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return comments;
  }

  /**
   * Thêm bình luận cho nhật ký
   */
  async addComment(diaryId: string, userId: string, createCommentDto: CreateCommentDto) {
    // Kiểm tra diary có tồn tại và được chia sẻ không
    const diary = await this.prisma.diary.findUnique({
      where: { id: diaryId },
    });

    if (!diary) {
      throw new NotFoundException('Không tìm thấy nhật ký');
    }

    // Chỉ cho phép comment trên diary được chia sẻ ẩn danh
    if (diary.privacyLevel !== PrivacyLevel.ANONYMOUS_SHARE) {
      throw new ForbiddenException('Chỉ có thể bình luận trên nhật ký được chia sẻ ẩn danh');
    }

    const comment = await this.prisma.diaryComment.create({
      data: {
        diaryId,
        userId,
        content: createCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return comment;
  }

  /**
   * Cập nhật bình luận
   */
  async updateComment(commentId: string, userId: string, updateCommentDto: UpdateCommentDto) {
    const comment = await this.prisma.diaryComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    // Chỉ chủ sở hữu mới được cập nhật
    if (comment.userId !== userId) {
      throw new ForbiddenException('Bạn không có quyền cập nhật bình luận này');
    }

    const updatedComment = await this.prisma.diaryComment.update({
      where: { id: commentId },
      data: {
        content: updateCommentDto.content,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return updatedComment;
  }

  /**
   * Xóa bình luận
   * User có thể xóa bình luận của mình
   * Admin có thể xóa bất kỳ bình luận nào
   */
  async deleteComment(commentId: string, userId: string, userRoles: string[]) {
    const comment = await this.prisma.diaryComment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Không tìm thấy bình luận');
    }

    const isAdmin = userRoles.includes('ADMIN') || userRoles.includes('SUPER_ADMIN');
    const isOwner = comment.userId === userId;

    // Chỉ chủ sở hữu hoặc admin mới được xóa
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('Bạn không có quyền xóa bình luận này');
    }

    await this.prisma.diaryComment.delete({
      where: { id: commentId },
    });

    return { message: 'Xóa bình luận thành công' };
  }
}
