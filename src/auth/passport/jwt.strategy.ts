import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma.service';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    console.log('JWT payload:', payload);
    const blacklisted = await this.prisma.blacklist.findUnique({
      where: { token: payload.jti },
    });

    if (blacklisted) {
      throw new UnauthorizedException('Token has been blacklisted');
    }

    // ✅ Validate user & enrich with roles + permissions
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

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Map roles
    const roles = user.userRoles.map((ur) => ur.role.name);

    // Map permissions
    const permissions = user.userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.name),
    );

    console.log('User roles:', roles);
    console.log('User permissions:', permissions);

    // ✅ Return user object with roles and permissions attached
    return {
      ...user,
      roles,
      permissions,
    };
  }
}
