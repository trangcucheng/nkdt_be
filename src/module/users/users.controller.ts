import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Request,
  Query,
  BadRequestException,
  Delete,
  Put,
  NotFoundException,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiBody, ApiConsumes } from '@nestjs/swagger';
import { Prisma, User } from '@prisma/client';
import { GetAllUsersDto } from './dto/pagination.dto';
import { UpdateUserDTO } from './dto/update-user.dto';
import { Permissions } from 'src/decorator/permissions.decorator';
import { AssignRoleDTO } from './dto/assign-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { CreateUserDTO } from './dto/create-user.dto';
import { Public } from 'src/decorator/public.decorator';
import { JwtAuthGuard } from 'src/auth/passport/jwt-auth.guard';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('users')
export class UsersController {
  constructor(private userService: UsersService) {}

  @Get('/list-all-user')
  @UseGuards(JwtAuthGuard)
  @Permissions('VIEW_USER')
  async getAllUsers(@Query() query: GetAllUsersDto): Promise<User[]> {
    const { page = '1', pageSize = '10', orderBy, role } = query;

    // Xử lý orderBy string (vd: 'createdAt:desc')
    let orderByObj: Prisma.UserOrderByWithRelationInput | undefined;
    if (orderBy) {
      const [field, sort] = orderBy.split(':');
      orderByObj = {
        [field]: sort === 'desc' ? 'desc' : 'asc',
      };
    }

    return this.userService.getAllUsers({
      page: Number(page),
      pageSize: Number(pageSize),
      orderBy: orderByObj,
      role, // truyền role riêng, không gán vào where
    });
  }

  @Public()
  @Permissions('CREATE_USER')
  @Post('/create-user')
  async create(
    @Body()
    createUserDTO: CreateUserDTO,
  ) {
    return await this.userService.createUser(createUserDTO);
  }

  @Put('/update-user')
  @Permissions('UPDATE_USER')
  async updateUser(
    @Query('userId') userId: string,
    @Body() updateUserDTO: UpdateUserDTO,
    @Request() req: any,
  ) {
    try {
      await this.userService.updateUser(
        {
          where: { id: userId },
        },
        updateUserDTO,
      );
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          status: 'error',
          statusCode: 404,
          message: `User with id ${userId} not found`,
        });
      }
      throw error;
    }
    return {
      status: 'success',
      statusCode: 200,
      message: 'User updated successfully',
      data: updateUserDTO,
    };
  }

  @Delete('/delete-user')
  @Permissions('DELETE_USER')
  async deleteUser(
    @Query('userId') userId: string,
    @Request() req: any, // Use 'any' type for request to access user object
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    try {
      await this.userService.deleteUser({ id: userId });
      return {
        status: 'success',
        statusCode: 200,
        message: `User with id ${userId} deleted successfully`,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          status: 'error',
          statusCode: 404,
          message: `User with id ${userId} not found`,
        });
      }
      throw error;
    }
  }

  @Get('/detail-user')
  async getUserById(
    @Query('userId') userId: string,
    @Request() req: any, // Use 'any' type for request to access user object
  ): Promise<User | null> {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    const user = await this.userService.getUserById(userId);
    if (!user) {
      throw new NotFoundException({
        status: 'error',
        statusCode: 404,
        message: `User with id ${userId} not found`,
      });
    }
    return user;
  }

  @Get('/get-user-by-email')
  async getUserByEmail(
    @Query('email') email: string,
    @Request() req: any, // Use 'any' type for request to access user object
  ): Promise<User | null> {
    if (!email) {
      throw new BadRequestException('Email is required');
    }
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException({
        status: 'error',
        statusCode: 404,
        message: `User with email ${email} not found`,
      });
    }
    return user;
  }

  @Patch('/block-user')
  @Permissions('BLOCK_USER')
  async blockUser(
    @Query('userId') userId: string,
    @Request() req: any, // Use 'any' type for request to access user object
  ) {
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }
    try {
      const updatedUser = await this.userService.blockUser(userId);
      return {
        status: 'success',
        statusCode: 200,
        message: `User with id ${userId} is now ${updatedUser.blocked ? 'blocked' : 'unblocked'}`,
      };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new NotFoundException({
          status: 'error',
          statusCode: 404,
          message: `User with id ${userId} not found`,
        });
      }
      throw error;
    }
  }

  // Gán role cho user
  @Post('/assign-role')
  @Permissions('ASSIGN_ROLE')
  async assignRole(@Body() dto: AssignRoleDTO) {
    return this.userService.assignRole(dto);
  }

  @Post('/upload-avatar')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/avatar',
        filename: (req, file, cb) => {
          if (!file || !file.originalname) {
            cb(new BadRequestException('No file uploaded'), '');
            return;
          }
          const ext = path.extname(file.originalname);
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  async uploadAvatar(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    const avatarUrl = `/uploads/avatar/${file.filename}`;
    return this.userService.uploadAvatar(req.user.id, avatarUrl);
  }
}
