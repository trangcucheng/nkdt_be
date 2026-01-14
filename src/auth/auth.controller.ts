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
} from '@nestjs/common';
import { LoginDTO } from './dto/login.dto';
import { Public } from 'src/decorator/public.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ForgotPasswordDTO } from './dto/forgot-password.dto';
import { ResetPasswordDTO } from './dto/reset-password.dto';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { CreateUserDTO } from 'src/module/users/dto/create-user.dto';
import { JwtAuthGuard } from './passport/jwt-auth.guard';

@ApiBearerAuth('access-token') // Use the name defined in main.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Get('/profile')
  async getProfile(@Request() req: any) {
    return req.user;
  }

  @Public()
  @Post('/signup')
  async create(
    @Body()
    createUserDTO: CreateUserDTO,
  ) {
    return await this.authService.signup(createUserDTO);
  }

  @Public()
  @Post('/login')
  async login(
    @Body()
    loginDTO: LoginDTO,
    @Request() req: any,
  ) {
    return await this.authService.login(loginDTO, req);
  }

  @Public()
  @Post('/forgot-password')
  async forgotPassword(
    @Body() forgotPassword: ForgotPasswordDTO,
    @Request() req: any,
  ) {
    if (!forgotPassword.email) {
      throw new BadRequestException('Email is required');
    }
    return this.authService.forgotPassword(forgotPassword.email);
  }

  @Public()
  @Post('/reset-password')
  async resetPassword(
    @Body() resetPassword: ResetPasswordDTO,
    @Request() req: any,
  ) {
    const { token, newPassword } = resetPassword;
    if (!token || !newPassword) {
      throw new BadRequestException('Token and new password are required');
    }
    return this.authService.resetPassword(token, newPassword);
  }

  @Public()
  @Post('/refresh-token')
  async refreshToken(@Body() body: { refreshToken: string }) {
    if (!body.refreshToken) {
      throw new BadRequestException('Refresh token is required');
    }
    return this.authService.refreshToken(body.refreshToken);
  }

  @Post('/logout')
  async logout(@Request() req: any) {
    const token = req.headers.authorization?.split(' ')[1];
    return this.authService.logout(req.user.id, token);
  }

  @Put('/change-password')
  async changePassword(
    @Request() req: any,
    @Body() changePasswordDTO: ChangePasswordDTO,
  ) {
    return this.authService.changePassword(req.user.sub, changePasswordDTO);
  }
}
