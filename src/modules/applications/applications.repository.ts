import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateRequest } from './dto';

@Injectable()
export class ApplicationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateRequest) {
    return this.prisma.application.create({
      data: {
        name: dto.name,
        phone: dto.phone,
        message: dto.message,
        userId: dto.userId,
      },
    });
  }
}
