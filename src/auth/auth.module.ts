import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { jwtConstants } from 'src/module/users/constants';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './passport/jwt.strategy';

@Module({
  imports: [
    PassportModule,
    AuthModule,
    // JwtModule.registerAsync({
    //   useFactory: async (configService: ConfigService) => ({
    //     global: true,
    //     secret: configService.get<string>('JWT_SECRET'),
    //     signOptions: {
    //       expiresIn: configService.get<string>('JWT_ACCESS_TOKEN_EXPIRED'),
    //     },
    //   }),
    //   inject: [ConfigService],
    // }),
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret, // Use the secret from constants
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [PrismaService, AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
