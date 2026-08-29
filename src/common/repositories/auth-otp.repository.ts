import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/database/prisma/prisma.service';

@Injectable()
export class AuthOtpRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByPhone(phone: string) {
    return this.prisma.authOtp.findFirst({
      where: { phone },
      orderBy: { createdAt: 'desc' },
    });
  }

  deletePhones(phone: string) {
    return this.prisma.authOtp.deleteMany({ where: { phone } });
  }

  create(phone: string, codeHash: string, expiresAt: Date) {
    return this.prisma.authOtp.create({
      data: {
        phone,
        code: codeHash,
        expiresAt,
      },
    });
  }

  increment(id: string) {
    return this.prisma.authOtp.update({
      where: { id },
      data: { attempts: { increment: 1 } },
    });
  }
}
