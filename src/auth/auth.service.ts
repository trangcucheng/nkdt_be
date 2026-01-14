import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { LoginDTO } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { SignupResponse } from 'src/module/users/user';
import { CreateUserDTO } from 'src/module/users/dto/create-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { Request } from 'express';
import { isValidEmail } from 'src/helper/util';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async signup(payload: CreateUserDTO): Promise<SignupResponse> {
    if (!payload.email || payload.email.trim() === '') {
      throw new BadRequestException('Email is required');
    }

    if (!isValidEmail(payload.email)) {
      throw new BadRequestException('Invalid email format');
    }
    // Tìm role USER trước
    const userRole = await this.prisma.role_.findUnique({
      where: { name: 'USER' },
    });

    if (!userRole) {
      throw new Error('Default USER role not found');
    }
    const existingUser = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });
    if (existingUser) {
      throw new BadRequestException(
        'User created with the email you provided',
        {
          cause: new Error(),
          description: 'user is already registered',
        },
      );
    }
    const hash = await this.encryptPassword(payload.password, 10);
    payload.password = hash;
    return await this.prisma.user.create({
      data: {
        ...payload,
        userRoles: {
          create: [
            {
              role: {
                connect: { id: userRole.id },
              },
            },
          ],
        },
      },
      include: { userRoles: true },
      // select: {
      //   email: true,
      //   id: true,
      // },
    });
  }

  async login(
    loginDTO: LoginDTO,
    req: Request,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // find user based on email
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDTO.email,
      },
      include: {
        userRoles: {
          include: {
            role: true, // lấy thông tin role từ UserRole -> Role_
          },
        },
      },
    });

    if (!user || user.blocked) {
      throw new UnauthorizedException('User not found or blocked');
    }

    // Check if user has password set
    if (!user.password) {
      throw new UnauthorizedException('Password not set for this user');
    }

    // check password
    const isMatched = await this.decryptPassword(
      loginDTO.password,
      user.password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Invalid password');
    }

    // Lấy danh sách role name của user
    const roles = user.userRoles.map((ur) => ur.role.name);

    // generate JWT access token (short-lived)
    const accessToken = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
        roles, // đưa mảng roles vào token
        jti: uuidv4(),
      },
      { expiresIn: '15m' },
    );

    // generate refresh token (long-lived)
    const refreshToken = await this.jwtService.signAsync(
      {
        email: user.email,
        id: user.id,
        type: 'refresh',
        jti: uuidv4(),
      },
      { expiresIn: '7d' }, // 7 days
    );

    // Optionally: Save refreshToken to database for revocation capability
    await this.prisma.user.update({
      where: { id: user.id },
      data: { refreshToken },
    });

    // ✅ Save login history
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress: ip,
        userAgent: req.headers['user-agent'],
        device: this.detectDevice(req.headers['user-agent']),
        location: null, // nếu có tích hợp IP geo service,
      },
    });

    return { accessToken, refreshToken };
  }

  private detectDevice(userAgent: string | undefined): string {
    if (!userAgent) return 'unknown';
    if (/mobile/i.test(userAgent)) return 'mobile';
    if (/tablet/i.test(userAgent)) return 'tablet';
    return 'desktop';
  }

  async encryptPassword(plainText: any, saltRounds: any) {
    return await bcrypt.hash(plainText, saltRounds);
  }

  async decryptPassword(plainText: any, hash: any) {
    if (!plainText || !hash) {
      return false;
    }
    return await bcrypt.compare(plainText, hash);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Generate JWT reset token (expires in 1h)
    const resetToken = jwt.sign(
      { email },
      process.env.JWT_SECRET || 'reset-secret',
      { expiresIn: '1h' },
    );

    return {
      resetToken: resetToken,
    };
  }

  async resetPassword(token: string, newPassword: string): Promise<string> {
    try {
      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET || 'reset-secret',
      );

      const user = await this.prisma.user.findUnique({
        where: { email: decoded.email },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      const hashed = await this.encryptPassword(newPassword, 10);

      await this.prisma.user.update({
        where: { email: decoded.email },
        data: { password: hashed },
      });

      return 'Password has been reset successfully';
    } catch (error) {
      throw new BadRequestException('Invalid or expired token');
    }
  }

  async changePassword(
    userId: string,
    changePasswordDTO: ChangePasswordDTO,
  ): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isMatched = await this.decryptPassword(
      changePasswordDTO.oldPassword,
      user.password,
    );
    if (!isMatched) {
      throw new UnauthorizedException('Old password is incorrect');
    }
    const hashedNewPassword = await this.encryptPassword(
      changePasswordDTO.newPassword,
      10,
    );
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword },
    });
    return 'Password changed successfully';
  }

  async logout(userId: string, token: string) {
    if (!userId || !token) {
      throw new BadRequestException(
        'User ID and token are required for logout',
      );
    }

    const decoded = this.jwtService.decode(token) as any;
    if (!decoded?.jti || !decoded?.exp) {
      throw new BadRequestException('Invalid token');
    }

    await this.prisma.blacklist.create({
      data: {
        token: decoded.jti,
        expiredAt: new Date(decoded.exp * 1000),
      },
    });

    // Clear refreshToken if using refresh tokens
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });

    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded: any = this.jwtService.verify(refreshToken);

      if (decoded.type !== 'refresh') {
        throw new UnauthorizedException('Invalid refresh token type');
      }

      // Find user and validate refresh token matches
      const user = await this.prisma.user.findUnique({
        where: { id: decoded.id },
        include: {
          userRoles: {
            include: {
              role: true,
            },
          },
        },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      if (user.blocked) {
        throw new UnauthorizedException('User is blocked');
      }

      // Get roles
      const roles = user.userRoles.map((ur) => ur.role.name);

      // Generate new access token
      const accessToken = await this.jwtService.signAsync(
        {
          email: user.email,
          id: user.id,
          roles,
          jti: uuidv4(),
        },
        { expiresIn: '15m' },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async validateUser(payload: any) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) return null;

    const roles = user.userRoles.map((ur) => ur.role.name);
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name),
    );

    return {
      ...user,
      roles,
      permissions,
    };
  }
}
