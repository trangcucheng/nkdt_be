import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDTO } from './dto/create-user.dto';
import { SignupResponse } from './user';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import { UpdateUserDTO } from './dto/update-user.dto';
import * as jwt from 'jsonwebtoken';
import { AssignRoleDTO } from './dto/assign-role.dto';

export interface ImportResult {
  email: string;
  firstName: string;
  lastName: string;
  status: 'success' | 'failed';
  reason?: string;
  userId?: string;
  generatedPassword?: string;
}

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async getAllUsers(params: {
    page: number;
    pageSize: number;
    orderBy?: Prisma.UserOrderByWithRelationInput;
    role?: string;
  }): Promise<User[]> {
    const { page, pageSize, orderBy, role } = params;

    return this.prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy,
      where: {
        ...(role
          ? {
              userRoles: {
                some: {
                  role: {
                    name: role,
                  },
                },
              },
            }
          : {}),
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });
  }

  async createUser(payload: CreateUserDTO): Promise<SignupResponse> {
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
      data: payload,
      select: {
        email: true,
        id: true,
      },
    });
  }

  async updateUser(
    params: {
      where: Prisma.UserWhereUniqueInput;
    },
    updateUserDto: UpdateUserDTO,
  ): Promise<User> {
    const { where } = params;
    return this.prisma.user.update({
      where,
      data: {
        ...updateUserDto,
      },
    });
  }

  async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prisma.user.delete({
      where,
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async blockUser(userId: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { blocked: !user.blocked },
    });

    return updatedUser;
  }

  async assignRole(dto: AssignRoleDTO) {
    const { userId, roleId } = dto;

    // Kiểm tra user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Kiểm tra role
    const role = await this.prisma.role_.findUnique({
      where: { id: roleId },
    });
    if (!role) throw new NotFoundException('Role not found');

    // Gán role cho user
    return await this.prisma.userRole.upsert({
      where: {
        userId_roleId: { userId, roleId },
      },
      update: {},
      create: { userId, roleId },
    });
  }

  async uploadAvatar(userId: string, avatarUrl: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async encryptPassword(plainText: any, saltRounds: any) {
    return await bcrypt.hash(plainText, saltRounds);
  }

  async decryptPassword(plainText: any, hash: any) {
    return await bcrypt.compare(plainText, hash);
  }

  async importUsers(users: any[]) {
    const results: ImportResult[] = [];

    for (const userData of users) {
      try {
        // Validate required fields
        if (!userData.firstName || !userData.lastName || !userData.email) {
          results.push({
            email: userData.email || 'N/A',
            firstName: userData.firstName,
            lastName: userData.lastName,
            status: 'failed',
            reason: 'Thiếu thông tin bắt buộc (Họ, Tên, Email)',
          });
          continue;
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
          where: { email: userData.email },
        });

        if (existingUser) {
          results.push({
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            status: 'failed',
            reason: 'Email đã tồn tại trong hệ thống',
          });
          continue;
        }

        // Find unit by code if provided
        let unitId: number | null = null;
        if (userData.unitCode) {
          const unit = await this.prisma.unit.findUnique({
            where: { code: userData.unitCode },
          });
          if (!unit) {
            results.push({
              email: userData.email,
              firstName: userData.firstName,
              lastName: userData.lastName,
              status: 'failed',
              reason: `Không tìm thấy đơn vị với mã: ${userData.unitCode}`,
            });
            continue;
          }
          unitId = unit.id;
        }

        // Generate password if not provided
        const password = userData.password || this.generateRandomPassword();
        const hashedPassword = await this.encryptPassword(password, 10);

        // Create user
        const newUser = await this.prisma.user.create({
          data: {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phoneNumber: userData.phoneNumber || null,
            password: hashedPassword,
            unitId: unitId,
          },
        });

        results.push({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: 'success',
          userId: newUser.id,
          generatedPassword: userData.password ? null : password,
        });
      } catch (error) {
        results.push({
          email: userData.email || 'N/A',
          firstName: userData.firstName,
          lastName: userData.lastName,
          status: 'failed',
          reason: error.message || 'Lỗi không xác định',
        });
      }
    }

    return {
      total: users.length,
      success: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'failed').length,
      results,
    };
  }

  private generateRandomPassword(): string {
    const length = 12;
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return password;
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    // Tìm user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng');
    }

    // Kiểm tra mật khẩu hiện tại
    const isPasswordValid = await this.decryptPassword(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Mật khẩu hiện tại không đúng');
    }

    // Kiểm tra mật khẩu mới không trùng mật khẩu cũ
    const isSamePassword = await this.decryptPassword(
      newPassword,
      user.password,
    );

    if (isSamePassword) {
      throw new BadRequestException(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại',
      );
    }

    // Hash mật khẩu mới
    const hashedPassword = await this.encryptPassword(newPassword, 10);

    // Cập nhật mật khẩu
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return {
      message: 'Đổi mật khẩu thành công',
    };
  }
}
