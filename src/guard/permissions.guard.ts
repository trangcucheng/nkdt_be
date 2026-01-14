import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from 'src/decorator/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) return true;

    const { user } = context.switchToHttp().getRequest();

    console.log(`Checking permissions: ${requiredPermissions}`);

    console.log('User from request:', user);

    if (!user) throw new ForbiddenException('No user found');

    // ✅ ADMIN bypass
    if (user.roles?.includes('ADMIN')) {
      console.log('User is ADMIN. Permissions bypassed.');
      return true;
    }

    const userPermissions = user.permissions || [];

    const hasPermission = requiredPermissions.every((perm) =>
      userPermissions.includes(perm),
    );

    if (!hasPermission) {
      console.log(`Missing permissions: ${requiredPermissions}`);
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
