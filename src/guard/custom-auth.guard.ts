import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { PrismaService } from 'src/prisma.service';
import { ConfigService } from '@nestjs/config';
import { IS_PUBLIC_KEY } from 'src/decorator/public.decorator';
import { jwtConstants } from 'src/module/users/constants';

@Injectable()
export class CustomAuthGuard implements CanActivate {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret:
          this.configService.get<string>('JWT_SECRET') || jwtConstants.secret,
      });
      console.log('payload...', JSON.stringify(payload));

      // 🔥 Check user exists & blocked status
      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (user.blocked) {
        throw new UnauthorizedException('User is blocked');
      }

      request['user'] = user; // attach full user object

      // Optional: check token purpose
      if (payload.purpose && payload.purpose === 'reset') {
        // This is a reset password token
        console.log('Reset password token used');
        request['user'] = payload;
      } else {
        // Normal auth token
        console.log('Auth token used');
      }
    } catch (err) {
      console.error('Invalid token', err);
      throw new UnauthorizedException('Invalid token');
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
