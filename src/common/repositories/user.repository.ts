import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { publicUserSelect } from '../selects/user.select';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });
  }

  findMany(skip: number, take: number) {
    return this.prisma.user.findMany({
      select: publicUserSelect,
      skip,
      take,
    });
  }

  count() {
    return this.prisma.user.count();
  }
}
