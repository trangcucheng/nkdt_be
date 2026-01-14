import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class BlacklistService {
  constructor(private prisma: PrismaService) {}

  async isBlacklisted(token: string) {
    return await this.prisma.blacklist.findFirst({
      where: { token },
    });
  }

  async add(token: string, expiredAt: Date) {
    return await this.prisma.blacklist.create({
      data: { token, expiredAt },
    });
  }
}
