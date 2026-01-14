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
}
