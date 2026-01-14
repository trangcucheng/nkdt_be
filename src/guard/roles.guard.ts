import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorator/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();

    if (!user) return false;

    // ✅ ADMIN bypass
    if (user.roles?.includes('ADMIN')) {
      console.log('User is ADMIN. Roles bypassed.');
      return true;
    }

    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
