import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById<T extends Prisma.UserSelect | undefined = undefined>(
    id: string,
    select?: T,
  ): Promise<Prisma.UserGetPayload<{ select: T }> | null> {
    return (await this.prisma.user.findUnique({
      where: { id },
      select,
    })) as any;
  }
}
