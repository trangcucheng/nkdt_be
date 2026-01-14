import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { DashboardQueryDto } from './dto/dashboard-query.dto';
import { 
  EmotionOverviewDto, 
  UnitEmotionStatsDto, 
  HashtagTrendDto,
  EmotionBreakdownDto,
  DailyEmotionTrendDto,
  EmotionRatioDto
} from './dto/dashboard-response.dto';
import { EmotionStatus, PrivacyLevel } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  /**
   * Lấy tổng quan cảm xúc cho admin
   */
  async getEmotionOverview(userId: string, query: DashboardQueryDto): Promise<EmotionOverviewDto> {
    const { unitId, startDate, endDate, days = 30 } = query;
    
    // Xác định khoảng thời gian
    const dateRange = this.getDateRange(startDate, endDate, days);
    
    // Lấy user info để check quyền
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
        },
        unit: true
      }
    });

    // Check permissions và xác định scope
    const allowedUnitIds = await this.getAllowedUnits(user, unitId);
    
    const where: any = {
      date: {
        gte: dateRange.start,
        lte: dateRange.end
      },
      privacyLevel: {
        in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY]
      }
    };

    if (allowedUnitIds.length > 0) {
      where.user = {
        unitId: {
          in: allowedUnitIds
        }
      };
    }

    // Tổng số nhật ký
    const totalDiaries = await this.prisma.diary.count({ where });

    // Số người dùng active
    const activeUsers = await this.prisma.diary.groupBy({
      by: ['userId'],
      where,
    }).then(results => results.length);

    // Phân bố cảm xúc
    const emotionStats = await this.prisma.diary.groupBy({
      by: ['emotionStatus'],
      where,
      _count: {
        emotionStatus: true
      }
    });

    const emotionBreakdown: EmotionBreakdownDto[] = emotionStats.map(stat => ({
      emotionStatus: stat.emotionStatus,
      count: stat._count.emotionStatus,
      percentage: Math.round((stat._count.emotionStatus / totalDiaries) * 100)
    }));

    // Xu hướng cảm xúc 7 ngày gần nhất
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);
    
    const dailyTrends = await this.prisma.diary.groupBy({
      by: ['date', 'emotionStatus'],
      where: {
        ...where,
        date: {
          gte: last7Days,
          lte: dateRange.end
        }
      },
      _count: {
        emotionStatus: true
      },
      orderBy: {
        date: 'desc'
      }
    });

    const emotionTrends = this.processDailyTrends(dailyTrends);
    const emotionRatio = this.calculateEmotionRatio(emotionBreakdown);

    return {
      totalDiaries,
      activeUsers,
      emotionBreakdown,
      emotionTrends,
      emotionRatio
    };
  }

  /**
   * Lấy thống kê cảm xúc theo đơn vị
   */
  async getUnitEmotionStats(userId: string, query: DashboardQueryDto): Promise<UnitEmotionStatsDto[]> {
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
        },
        unit: true
      }
    });

    const allowedUnitIds = await this.getAllowedUnits(user, query.unitId);
    const dateRange = this.getDateRange(query.startDate, query.endDate, query.days);

    const units = await this.prisma.unit.findMany({
      where: {
        id: {
          in: allowedUnitIds.length > 0 ? allowedUnitIds : undefined
        }
      },
      include: {
        users: {
          include: {
            diaries: {
              where: {
                date: {
                  gte: dateRange.start,
                  lte: dateRange.end
                },
                privacyLevel: {
                  in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY]
                }
              }
            }
          }
        }
      }
    });

    return units.map(unit => {
      const allDiaries = unit.users.flatMap(user => user.diaries);
      const activeUsers = unit.users.filter(user => user.diaries.length > 0).length;
      
      const emotionStats = this.groupByEmotion(allDiaries);
      const avgScore = this.calculateAverageEmotionScore(allDiaries);
      const alertLevel = this.determineAlertLevel(emotionStats, avgScore);

      return {
        unitId: unit.id,
        unitName: unit.name,
        totalDiaries: allDiaries.length,
        activeUsers,
        avgEmotionScore: avgScore,
        emotionBreakdown: emotionStats,
        alertLevel
      };
    });
  }

  /**
   * Lấy xu hướng hashtag phổ biến
   */
  async getHashtagTrends(userId: string, query: DashboardQueryDto): Promise<HashtagTrendDto[]> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { unit: true }
    });

    const allowedUnitIds = await this.getAllowedUnits(user, query.unitId);
    const dateRange = this.getDateRange(query.startDate, query.endDate, query.days);

    // Lấy hashtag từ current period
    const currentDiaries = await this.prisma.diary.findMany({
      where: {
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        privacyLevel: {
          in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY]
        },
        user: allowedUnitIds.length > 0 ? {
          unitId: { in: allowedUnitIds }
        } : undefined
      },
      select: {
        hashtags: true
      }
    });

    // Lấy hashtag từ previous period để so sánh
    const previousStart = new Date(dateRange.start);
    const previousEnd = new Date(dateRange.end);
    const periodLength = dateRange.end.getTime() - dateRange.start.getTime();
    previousStart.setTime(previousStart.getTime() - periodLength);
    previousEnd.setTime(previousEnd.getTime() - periodLength);

    const previousDiaries = await this.prisma.diary.findMany({
      where: {
        date: {
          gte: previousStart,
          lte: previousEnd
        },
        privacyLevel: {
          in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY]
        },
        user: allowedUnitIds.length > 0 ? {
          unitId: { in: allowedUnitIds }
        } : undefined
      },
      select: {
        hashtags: true
      }
    });

    return this.calculateHashtagTrends(currentDiaries, previousDiaries);
  }

  /**
   * Lấy các cảnh báo cảm xúc tiêu cực
   */
  async getEmotionAlerts(userId: string, query: DashboardQueryDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { unit: true }
    });

    const allowedUnitIds = await this.getAllowedUnits(user, query.unitId);

    return await this.prisma.emotionAlert.findMany({
      where: {
        unitId: allowedUnitIds.length > 0 ? {
          in: allowedUnitIds
        } : undefined,
        isResolved: false
      },
      include: {
        unit: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        resolver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        }
      },
      orderBy: [
        { alertLevel: 'desc' },
        { createdAt: 'desc' }
      ]
    });
  }

  // Helper methods
  private getDateRange(startDate?: string, endDate?: string, days: number = 30) {
    let start: Date, end: Date;
    
    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
    } else {
      end = new Date();
      start = new Date();
      start.setDate(start.getDate() - days);
    }
    
    end.setHours(23, 59, 59, 999);
    start.setHours(0, 0, 0, 0);
    
    return { start, end };
  }

  private async getAllowedUnits(user: any, requestedUnitId?: number): Promise<number[]> {
    // Check if user has roles loaded
    if (!user || !user.userRoles || !Array.isArray(user.userRoles)) {
      console.warn('User roles not loaded properly:', user);
      return user?.unitId ? [user.unitId] : [];
    }

    const permissions = user.userRoles.flatMap(ur => {
      if (!ur.role || !ur.role.rolePermissions) return [];
      return ur.role.rolePermissions.map(rp => rp.permission?.name).filter(Boolean);
    });

    // Super admin có thể xem tất cả
    if (permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      if (requestedUnitId) {
        return [requestedUnitId];
      }
      return [];
    }

    // Admin chỉ xem đơn vị của mình và đơn vị con
    if (permissions.includes('VIEW_UNIT_EMOTION_DASHBOARD') && user.unitId) {
      const unit = await this.prisma.unit.findUnique({
        where: { id: user.unitId },
        include: {
          children: true
        }
      });
      
      if (unit) {
        const allowedIds = [unit.id, ...unit.children.map(c => c.id)];
        return requestedUnitId && allowedIds.includes(requestedUnitId) 
          ? [requestedUnitId] 
          : allowedIds;
      }
    }

    throw new ForbiddenException('Không có quyền xem thống kê này');
  }

  private processDailyTrends(dailyTrends: any[]): DailyEmotionTrendDto[] {
    const trendMap = new Map<string, any>();
    
    dailyTrends.forEach(trend => {
      const dateStr = trend.date.toISOString().split('T')[0];
      if (!trendMap.has(dateStr)) {
        trendMap.set(dateStr, { positive: 0, neutral: 0, negative: 0, total: 0 });
      }
      
      const dayData = trendMap.get(dateStr);
      const isPositive = ['VERY_HAPPY', 'HAPPY', 'EXCITED'].includes(trend.emotionStatus);
      const isNegative = ['SAD', 'WORRIED', 'STRESSED', 'ANXIOUS', 'ANGRY'].includes(trend.emotionStatus);
      
      if (isPositive) {
        dayData.positive += trend._count.emotionStatus;
      } else if (isNegative) {
        dayData.negative += trend._count.emotionStatus;
      } else {
        dayData.neutral += trend._count.emotionStatus;
      }
      dayData.total += trend._count.emotionStatus;
    });

    return Array.from(trendMap.entries()).map(([date, data]) => ({
      date,
      ...data
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private calculateEmotionRatio(breakdown: EmotionBreakdownDto[]): EmotionRatioDto {
    let positive = 0, neutral = 0, negative = 0;
    
    breakdown.forEach(item => {
      const isPositive = ['VERY_HAPPY', 'HAPPY', 'EXCITED'].includes(item.emotionStatus);
      const isNegative = ['SAD', 'WORRIED', 'STRESSED', 'ANXIOUS', 'ANGRY'].includes(item.emotionStatus);
      
      if (isPositive) {
        positive += item.percentage;
      } else if (isNegative) {
        negative += item.percentage;
      } else {
        neutral += item.percentage;
      }
    });

    return { positive, neutral, negative };
  }

  private groupByEmotion(diaries: any[]): EmotionBreakdownDto[] {
    const emotionCounts = new Map<EmotionStatus, number>();
    
    diaries.forEach(diary => {
      const current = emotionCounts.get(diary.emotionStatus) || 0;
      emotionCounts.set(diary.emotionStatus, current + 1);
    });

    const total = diaries.length;
    return Array.from(emotionCounts.entries()).map(([emotion, count]) => ({
      emotionStatus: emotion,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));
  }

  private calculateAverageEmotionScore(diaries: any[]): number {
    if (diaries.length === 0) return 5;

    const emotionScores = {
      VERY_HAPPY: 10,
      HAPPY: 8,
      EXCITED: 8,
      NORMAL: 5,
      TIRED: 4,
      WORRIED: 3,
      STRESSED: 2,
      ANXIOUS: 2,
      SAD: 1,
      ANGRY: 1
    };

    const totalScore = diaries.reduce((sum, diary) => 
      sum + (emotionScores[diary.emotionStatus] || 5), 0);
    
    return Math.round((totalScore / diaries.length) * 10) / 10;
  }

  private determineAlertLevel(emotionStats: EmotionBreakdownDto[], avgScore: number): string {
    const negativeEmotions = ['SAD', 'WORRIED', 'STRESSED', 'ANXIOUS', 'ANGRY'];
    const negativePercentage = emotionStats
      .filter(stat => negativeEmotions.includes(stat.emotionStatus))
      .reduce((sum, stat) => sum + stat.percentage, 0);

    if (avgScore < 3 || negativePercentage > 60) return 'CRITICAL';
    if (avgScore < 4 || negativePercentage > 40) return 'HIGH';
    if (avgScore < 5 || negativePercentage > 25) return 'MEDIUM';
    return 'LOW';
  }

  private calculateHashtagTrends(currentDiaries: any[], previousDiaries: any[]): HashtagTrendDto[] {
    const currentHashtags = this.extractHashtagCounts(currentDiaries);
    const previousHashtags = this.extractHashtagCounts(previousDiaries);

    return Array.from(currentHashtags.entries())
      .map(([hashtag, currentCount]) => {
        const previousCount = previousHashtags.get(hashtag) || 0;
        const changePercent = previousCount > 0 
          ? Math.round(((currentCount - previousCount) / previousCount) * 100)
          : 100;
        
        let trend = 'STABLE';
        if (changePercent > 20) trend = 'UP';
        else if (changePercent < -20) trend = 'DOWN';

        return {
          hashtag,
          count: currentCount,
          trend,
          changePercent
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 20); // Top 20 hashtags
  }

  private extractHashtagCounts(diaries: any[]): Map<string, number> {
    const hashtagCounts = new Map<string, number>();
    
    diaries.forEach(diary => {
      if (diary.hashtags && Array.isArray(diary.hashtags)) {
        diary.hashtags.forEach(hashtag => {
          const current = hashtagCounts.get(hashtag) || 0;
          hashtagCounts.set(hashtag, current + 1);
        });
      }
    });

    return hashtagCounts;
  }

  /**
   * Lấy xu hướng cảm xúc theo thời gian
   */
  async getEmotionTrend(userId: string, query: DashboardQueryDto) {
    const { unitId, startDate, endDate, days = 30 } = query;
    const dateRange = this.getDateRange(startDate, endDate, days);
    
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { 
        unit: true, 
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

    const allowedUnitIds = await this.getAllowedUnits(user, unitId);
    
    const where: any = {
      date: { gte: dateRange.start, lte: dateRange.end },
      privacyLevel: { in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY] }
    };

    if (allowedUnitIds.length > 0) {
      where.user = { unitId: { in: allowedUnitIds } };
    }

    const diaries = await this.prisma.diary.findMany({
      where,
      select: { date: true, emotionStatus: true }
    });

    // Group by date
    const trendMap = new Map();
    diaries.forEach(diary => {
      const dateKey = diary.date.toISOString().split('T')[0];
      if (!trendMap.has(dateKey)) {
        trendMap.set(dateKey, { date: dateKey, positive: 0, neutral: 0, negative: 0 });
      }
      
      const trend = trendMap.get(dateKey);
      const emotion = diary.emotionStatus;
      
      if (['VERY_HAPPY', 'HAPPY', 'EXCITED'].includes(emotion)) {
        trend.positive++;
      } else if (['NORMAL', 'TIRED'].includes(emotion)) {
        trend.neutral++;
      } else {
        trend.negative++;
      }
    });

    return Array.from(trendMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Lấy danh sách người dùng
   */
  async getUsersList(userId: string, query: DashboardQueryDto) {
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

    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        unitId: true,
        unit: { select: { id: true, name: true } },
        userRoles: {
          include: { role: { select: { name: true } } }
        },
        diaries: {
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 1
        },
        _count: { select: { diaries: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(u => ({
      id: u.id,
      email: u.email,
      firstName: u.firstName,
      lastName: u.lastName,
      unitId: u.unitId,
      unit: u.unit,
      role: u.userRoles[0]?.role?.name || 'USER',
      diaryCount: u._count.diaries,
      lastActivityDate: u.diaries[0]?.createdAt || null
    }));
  }

  /**
   * Lấy danh sách đơn vị
   */
  async getUnitsList(userId: string, query: DashboardQueryDto) {
    const units = await this.prisma.unit.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select: { users: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return units.map(u => ({
      id: u.id,
      name: u.name,
      description: u.description,
      userCount: u._count.users
    }));
  }
}
