import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { EmotionStatus, AlertLevel, PrivacyLevel } from '@prisma/client';

@Injectable()
export class EmotionAnalyticsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Tự động tạo thống kê cảm xúc hàng ngày
   */
  async generateDailyEmotionStatistics() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    // Lấy tất cả diaries của ngày hôm qua
    const diaries = await this.prisma.diary.findMany({
      where: {
        date: {
          gte: yesterday,
          lte: endOfYesterday
        },
        privacyLevel: {
          in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY]
        }
      },
      include: {
        user: {
          select: {
            unitId: true
          }
        }
      }
    });

    // Group by unit và emotion
    const statsMap = new Map<string, { unitId: number | null, emotionStatus: EmotionStatus, count: number }>();

    diaries.forEach(diary => {
      const key = `${diary.user.unitId || 'null'}-${diary.emotionStatus}`;
      const current = statsMap.get(key) || { 
        unitId: diary.user.unitId, 
        emotionStatus: diary.emotionStatus, 
        count: 0 
      };
      current.count += 1;
      statsMap.set(key, current);
    });

    // Lưu vào database
    for (const stat of statsMap.values()) {
      await this.prisma.emotionStatistics.upsert({
        where: {
          unitId_date_emotionStatus: {
            unitId: (stat.unitId || null) as any,
            date: yesterday,
            emotionStatus: stat.emotionStatus
          }
        },
        update: {
          count: stat.count
        },
        create: {
          unitId: stat.unitId || null,
          date: yesterday,
          emotionStatus: stat.emotionStatus,
          count: stat.count
        }
      });
    }

    return { processed: statsMap.size };
  }

  /**
   * Tự động tạo hashtag trends
   */
  async generateDailyHashtagTrends() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const diaries = await this.prisma.diary.findMany({
      where: {
        date: {
          gte: yesterday,
          lte: endOfYesterday
        },
        privacyLevel: {
          in: [PrivacyLevel.ANONYMOUS_SHARE, PrivacyLevel.STATISTICS_ONLY]
        }
      },
      select: {
        hashtags: true,
        user: {
          select: {
            unitId: true
          }
        }
      }
    });

    // Process hashtags
    const hashtagMap = new Map<string, { unitId: number | null, hashtag: string, count: number }>();

    diaries.forEach(diary => {
      if (diary.hashtags && Array.isArray(diary.hashtags)) {
        (diary.hashtags as string[]).forEach(hashtag => {
          const key = `${diary.user.unitId || 'null'}-${hashtag}`;
          const current = hashtagMap.get(key) || {
            unitId: diary.user.unitId,
            hashtag: hashtag as string,
            count: 0
          };
          current.count += 1;
          hashtagMap.set(key, current);
        });
      }
    });

    // Lưu vào database
    for (const trend of hashtagMap.values()) {
      await this.prisma.hashtagTrend.upsert({
        where: {
          hashtag_unitId_date: {
            hashtag: trend.hashtag,
            unitId: (trend.unitId || null) as any,
            date: yesterday
          }
        },
        update: {
          count: trend.count
        },
        create: {
          hashtag: trend.hashtag,
          unitId: trend.unitId || null,
          date: yesterday,
          count: trend.count
        }
      });
    }

    return { processed: hashtagMap.size };
  }

  /**
   * Tự động phát hiện và tạo cảnh báo xu hướng tiêu cực
   */
  async detectEmotionAlerts() {
    const alerts: any[] = [];
    
    // Lấy stats 7 ngày gần nhất
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const recentStats = await this.prisma.emotionStatistics.findMany({
      where: {
        date: {
          gte: last7Days
        }
      },
      include: {
        unit: true
      }
    });

    // Group by unit
    const unitStatsMap = new Map<number | null, any[]>();
    recentStats.forEach(stat => {
      const unitId = stat.unitId;
      if (!unitStatsMap.has(unitId)) {
        unitStatsMap.set(unitId, []);
      }
      unitStatsMap.get(unitId)!.push(stat);
    });

    // Analyze each unit
    for (const [unitId, stats] of unitStatsMap.entries()) {
      const analysis = this.analyzeUnitEmotionTrend(stats);
      
      if (analysis.alertLevel !== 'LOW') {
        // Check if alert already exists
        const existingAlert = await this.prisma.emotionAlert.findFirst({
          where: {
            unitId: unitId,
            isResolved: false,
            createdAt: {
              gte: last7Days
            }
          }
        });

        if (!existingAlert) {
          const alert = await this.prisma.emotionAlert.create({
            data: {
              unitId: unitId,
              alertLevel: analysis.alertLevel,
              title: analysis.title,
              description: analysis.description
            }
          });
          alerts.push(alert);
        }
      }
    }

    return { alertsCreated: alerts.length };
  }

  /**
   * Phân tích xu hướng cảm xúc của một đơn vị
   */
  private analyzeUnitEmotionTrend(stats: any[]) {
    const totalDiaries = stats.reduce((sum, stat) => sum + stat.count, 0);
    
    if (totalDiaries === 0) {
      return {
        alertLevel: 'LOW' as AlertLevel,
        title: 'Không có dữ liệu',
        description: 'Đơn vị chưa có dữ liệu nhật ký trong 7 ngày qua'
      };
    }

    // Tính tỷ lệ cảm xúc tiêu cực
    const negativeEmotions = ['SAD', 'WORRIED', 'STRESSED', 'ANXIOUS', 'ANGRY'];
    const negativeCount = stats
      .filter(stat => negativeEmotions.includes(stat.emotionStatus))
      .reduce((sum, stat) => sum + stat.count, 0);
    
    const negativePercentage = (negativeCount / totalDiaries) * 100;
    
    // Tính điểm cảm xúc trung bình
    const emotionScores = {
      VERY_HAPPY: 10, HAPPY: 8, EXCITED: 8,
      NORMAL: 5, TIRED: 4,
      WORRIED: 3, STRESSED: 2, ANXIOUS: 2, SAD: 1, ANGRY: 1
    };
    
    const totalScore = stats.reduce((sum, stat) => 
      sum + (emotionScores[stat.emotionStatus] || 5) * stat.count, 0);
    const avgScore = totalScore / totalDiaries;

    // Xác định mức độ cảnh báo
    let alertLevel: AlertLevel = 'LOW';
    let title = '';
    let description = '';

    if (avgScore < 3 || negativePercentage > 60) {
      alertLevel = 'CRITICAL';
      title = 'Cảnh báo cực kỳ nghiêm trọng về tình hình tâm lý';
      description = `Đơn vị có ${negativePercentage.toFixed(1)}% cảm xúc tiêu cực với điểm trung bình ${avgScore.toFixed(1)}/10. Cần can thiệp ngay lập tức.`;
    } else if (avgScore < 4 || negativePercentage > 40) {
      alertLevel = 'HIGH';
      title = 'Cảnh báo cao về xu hướng cảm xúc tiêu cực';
      description = `Đơn vị có ${negativePercentage.toFixed(1)}% cảm xúc tiêu cực với điểm trung bình ${avgScore.toFixed(1)}/10. Cần quan tâm và hỗ trợ kịp thời.`;
    } else if (avgScore < 5 || negativePercentage > 25) {
      alertLevel = 'MEDIUM';
      title = 'Theo dõi xu hướng cảm xúc';
      description = `Đơn vị có ${negativePercentage.toFixed(1)}% cảm xúc tiêu cực với điểm trung bình ${avgScore.toFixed(1)}/10. Nên tăng cường hoạt động hỗ trợ tinh thần.`;
    }

    return { alertLevel, title, description };
  }

  /**
   * Lấy báo cáo phân tích cảm xúc chi tiết
   */
  async getDetailedEmotionReport(unitId?: number, startDate?: string, endDate?: string) {
    const dateRange = this.getDateRange(startDate, endDate, 30);
    
    const where: any = {
      date: {
        gte: dateRange.start,
        lte: dateRange.end
      }
    };

    if (unitId) {
      where.unitId = unitId;
    }

    // Thống kê tổng quan
    const totalStats = await this.prisma.emotionStatistics.aggregate({
      where,
      _sum: {
        count: true
      }
    });

    // Phân bố cảm xúc
    const emotionBreakdown = await this.prisma.emotionStatistics.groupBy({
      by: ['emotionStatus'],
      where,
      _sum: {
        count: true
      },
      orderBy: {
        _sum: {
          count: 'desc'
        }
      }
    });

    // Xu hướng theo thời gian
    const dailyTrends = await this.prisma.emotionStatistics.groupBy({
      by: ['date'],
      where,
      _sum: {
        count: true
      },
      orderBy: {
        date: 'desc'
      },
      take: 30
    });

    // Top hashtags
    const topHashtags = await this.prisma.hashtagTrend.groupBy({
      by: ['hashtag'],
      where: {
        date: {
          gte: dateRange.start,
          lte: dateRange.end
        },
        unitId: unitId || undefined
      },
      _sum: {
        count: true
      },
      orderBy: {
        _sum: {
          count: 'desc'
        }
      },
      take: 20
    });

    return {
      summary: {
        totalDiaries: totalStats._sum.count || 0,
        period: `${dateRange.start.toISOString().split('T')[0]} - ${dateRange.end.toISOString().split('T')[0]}`
      },
      emotionBreakdown,
      dailyTrends,
      topHashtags
    };
  }

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

  /**
   * Lấy danh sách cảnh báo cảm xúc
   */
  async getEmotionAlerts(
    userId: string, 
    unitId?: number, 
    status?: string, 
    severity?: string,
    page: number = 1,
    limit: number = 10
  ) {
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

    // Phân quyền xem alerts
    if (!permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      if (user?.unitId) {
        const allowedUnits = await this.getAllowedUnits(user.unitId);
        where.unitId = { in: allowedUnits };
      } else {
        // Nếu không thuộc đơn vị nào thì không xem được alerts nào
        where.unitId = -1;
      }
    }

    // Filter conditions
    if (unitId) {
      where.unitId = unitId;
    }
    
    if (status) {
      where.isResolved = status === 'resolved';
    }
    
    if (severity) {
      where.alertLevel = severity.toUpperCase();
    }

    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      this.prisma.emotionAlert.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          unit: {
            select: {
              id: true,
              code: true,
              name: true
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
        }
      }),
      this.prisma.emotionAlert.count({ where })
    ]);

    return {
      data: alerts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Giải quyết cảnh báo cảm xúc
   */
  async resolveEmotionAlert(
    alertId: string, 
    resolverId: string, 
    resolutionNote?: string,
    actions?: string
  ) {
    const alert = await this.prisma.emotionAlert.findUnique({
      where: { id: alertId },
      include: {
        unit: true
      }
    });

    if (!alert) {
      throw new NotFoundException('Không tìm thấy cảnh báo');
    }

    if (alert.isResolved) {
      throw new ForbiddenException('Cảnh báo đã được giải quyết trước đó');
    }

    // Kiểm tra quyền giải quyết
    const canResolve = await this.checkResolvePermission(resolverId, alert.unitId);
    if (!canResolve) {
      throw new ForbiddenException('Không có quyền giải quyết cảnh báo này');
    }

    const resolvedAlert = await this.prisma.emotionAlert.update({
      where: { id: alertId },
      data: {
        isResolved: true,
        resolvedBy: resolverId,
        resolvedAt: new Date(),
        resolutionNote: resolutionNote || null,
        actions: actions || null
      },
      include: {
        unit: {
          select: {
            id: true,
            code: true,
            name: true
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
      }
    });

    return resolvedAlert;
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

  private async checkResolvePermission(userId: string, unitId: number | null): Promise<boolean> {
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

    // Super admin có thể giải quyết mọi cảnh báo
    if (permissions.includes('VIEW_ALL_UNITS_ANALYTICS')) {
      return true;
    }

    // Manager có thể giải quyết cảnh báo của đơn vị mình quản lý
    if (permissions.includes('RESOLVE_EMOTION_ALERTS') && user?.unitId) {
      const allowedUnits = await this.getAllowedUnits(user.unitId);
      return unitId !== null && allowedUnits.includes(unitId);
    }

    return false;
  }
}