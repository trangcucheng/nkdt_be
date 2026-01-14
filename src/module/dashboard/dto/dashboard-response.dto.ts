import { ApiProperty } from '@nestjs/swagger';
import { EmotionStatus } from '@prisma/client';

export class EmotionBreakdownDto {
  @ApiProperty({ enum: EmotionStatus })
  emotionStatus: EmotionStatus;

  @ApiProperty()
  count: number;

  @ApiProperty()
  percentage: number;
}

export class DailyEmotionTrendDto {
  @ApiProperty()
  date: string;

  @ApiProperty()
  positive: number;

  @ApiProperty()
  neutral: number;

  @ApiProperty()
  negative: number;

  @ApiProperty()
  total: number;
}

export class EmotionRatioDto {
  @ApiProperty()
  positive: number;

  @ApiProperty()
  neutral: number;

  @ApiProperty()
  negative: number;
}

export class EmotionOverviewDto {
  @ApiProperty({
    description: 'Tổng số nhật ký trong khoảng thời gian',
    example: 150,
  })
  totalDiaries: number;

  @ApiProperty({
    description: 'Số người dùng đã viết nhật ký',
    example: 45,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Phân bố cảm xúc theo loại',
    example: [
      { emotionStatus: 'HAPPY', count: 60, percentage: 40 },
      { emotionStatus: 'NORMAL', count: 45, percentage: 30 },
      { emotionStatus: 'SAD', count: 30, percentage: 20 },
      { emotionStatus: 'WORRIED', count: 15, percentage: 10 }
    ]
  })
  emotionBreakdown: EmotionBreakdownDto[];

  @ApiProperty({
    description: 'Xu hướng cảm xúc theo ngày (7 ngày gần nhất)',
    example: [
      { date: '2026-01-06', positive: 25, neutral: 15, negative: 10 },
      { date: '2026-01-05', positive: 20, neutral: 18, negative: 12 }
    ]
  })
  emotionTrends: DailyEmotionTrendDto[];

  @ApiProperty({
    description: 'Tỷ lệ cảm xúc tích cực/tiêu cực',
    example: {
      positive: 65,
      neutral: 25,
      negative: 10
    }
  })
  emotionRatio: EmotionRatioDto;
}

export class UnitEmotionStatsDto {
  @ApiProperty()
  unitId: number;

  @ApiProperty()
  unitName: string;

  @ApiProperty()
  totalDiaries: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  avgEmotionScore: number; // 1-10 scale

  @ApiProperty({ type: [EmotionBreakdownDto] })
  emotionBreakdown: EmotionBreakdownDto[];

  @ApiProperty()
  alertLevel: string; // LOW, MEDIUM, HIGH, CRITICAL
}

export class HashtagTrendDto {
  @ApiProperty()
  hashtag: string;

  @ApiProperty()
  count: number;

  @ApiProperty()
  trend: string; // UP, DOWN, STABLE

  @ApiProperty()
  changePercent: number;
}