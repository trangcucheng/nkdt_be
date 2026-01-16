import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { APP_GUARD, Reflector } from '@nestjs/core';
import { CustomAuthGuard } from './guard/custom-auth.guard';
import { RolesGuard } from './guard/roles.guard';
import { ConfigModule } from '@nestjs/config';
import { PermissionsGuard } from './guard/permissions.guard';
import { AuthModule } from './auth/auth.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { UsersModule } from './module/users/users.module';
import { UnitsModule } from './module/units/units.module';
import { RolesModule } from './module/roles/roles.module';
import { PermissionsModule } from './module/permissions/permissions.module';
import { JwtAuthGuard } from './auth/passport/jwt-auth.guard';
import { ScheduleModule } from '@nestjs/schedule';
import { LoginHistoryModule } from './module/loginHistories/login-histories.module';
import { BlacklistModule } from './log/blacklist/blacklist.module';
import { CronCleanBlacklistService } from './log/blacklist/cron-clean-blacklist.service';
import { BackupModule } from './backup/backup.module';
import { ExportsModule } from './module/exports_/exports.module';
import { SignsModule } from './module/signs/signs.module';
import { DiaryModule } from './module/diary/diary.module';
import { DashboardModule } from './module/dashboard/dashboard.module';
import { EmotionAnalyticsModule } from './module/emotion-analytics/emotion-analytics.module';
import { SupportContentModule } from './module/support-content/support-content.module';
import { IdeologicalWorkNoteModule } from './module/ideological-work-note/ideological-work-note.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    UnitsModule,
    RolesModule,
    PermissionsModule,
    BlacklistModule,
    LoginHistoryModule,
    BackupModule,
    ExportsModule,
    SignsModule,
    DiaryModule,
    DashboardModule,
    EmotionAnalyticsModule,
    SupportContentModule,
    IdeologicalWorkNoteModule,
  ],
  controllers: [AppController],
  providers: [
    CronCleanBlacklistService,
    AppService,
    PrismaService,
    // {
    //   provide: APP_GUARD,
    //   useClass: CustomAuthGuard, // Global AuthGuard to run first
    // },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard, // Chỉ check token, không check permissions
    },
    // ❌ Comment out RolesGuard và PermissionsGuard - quá phức tạp
    // Chỉ áp dụng cho những route admin thực sự cần bằng @UseGuards
    // {
    //   provide: APP_GUARD,
    //   useClass: RolesGuard,
    // },
    // {
    //   provide: APP_GUARD,
    //   useClass: PermissionsGuard,
    // },
    Reflector,
    {
      provide: APP_GUARD,
      useClass: ThrottlerModule, // Global ThrottlerGuard to limit requests
    },
  ],
})
export class AppModule {}
