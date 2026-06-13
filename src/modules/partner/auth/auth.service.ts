import { SmsLogPurpose, UserRole } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AuthService as UserAuthService } from '@/modules/auth/auth.service';
import { PrismaService } from '@/database/prisma/prisma.service';
import { generateOtp } from '@/modules/auth/utils/generate-otp';
import { JwtAuthService } from '@/auth/jwt/jwt-auth.service';
import { UsersService } from '@/modules/users/users.service';
import { userSelect } from '@/common/selects/user.select';
import {
  PartnerRegisterRequestDto,
  PartnerRegisterVerifyDto,
} from '@/modules/partner/auth/dto/partner-auth.dto';
import { SmsService } from '@/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly smsService: SmsService,
    private readonly jwtService: JwtAuthService,
    private readonly userAuthService: UserAuthService,
    private readonly userService: UsersService,
  ) {}

  async registerRequest(dto: PartnerRegisterRequestDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        phone_role: {
          phone: dto.phone,
          role: UserRole.PARTNER,
        },
      },
    });

    if (user) {
      throw new ConflictException();
    }

    const lastOtp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.phone },
      orderBy: { createdAt: 'desc' },
    });

    if (lastOtp) {
      const diff = Date.now() - new Date(lastOtp.createdAt).getTime();

      if (diff < 60_000) {
        throw new HttpException(
          {
            message: 'OTP already sent',
            code: 'TOO_MANY_REQUESTS',
            error: {
              phone: dto.phone,
              different: diff,
            },
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }
    }

    await this.prisma.authOtp.deleteMany({ where: { phone: dto.phone } });

    const code = generateOtp();

    await this.prisma.authOtp.create({
      data: {
        phone: dto.phone,
        code,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minute
      },
    });

    await this.smsService.send({
      phone: dto.phone,
      message: `Ваш код подтверждения: ${code}`,
      purpose: user ? SmsLogPurpose.LOGIN : SmsLogPurpose.REGISTER,
    });

    return {
      success: true,
      message: `Код подтверждения отправлен на ${dto.phone}, код: ${code}`,
    };
  }

  async registerVerify(
    dto: PartnerRegisterVerifyDto,
    ip: string,
    userAgent?: string,
  ) {
    const otp = await this.prisma.authOtp.findFirst({
      where: { phone: dto.user_phone },
      orderBy: { createdAt: 'desc' },
    });

    if (!otp) {
      throw new BadRequestException();
    }

    if (otp.expiresAt < new Date()) {
      await this.prisma.authOtp.deleteMany({
        where: { phone: dto.user_phone },
      });

      throw new BadRequestException({
        message: 'OTP expired',
        code: 'BAD_REQUEST',
        error: dto.user_phone,
      });
    }

    if (otp.attempts >= 5) {
      await this.prisma.authOtp.deleteMany({
        where: { phone: dto.user_phone },
      });

      throw new HttpException(
        {
          message: 'Too many attempts. Please request new OTP',
          code: 'TOO_MANY_REQUESTS',
          error: dto.user_phone,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (otp.code !== dto.code) {
      await this.prisma.authOtp.update({
        where: { id: otp.id },
        data: { attempts: { increment: 1 } },
      });

      throw new BadRequestException({
        message: 'Invalid OTP',
        code: 'BAD_REQUEST',
        error: dto.code,
      });
    }

    const user = await this.prisma.user.create({
      data: {
        name: dto.user_name,
        phone: dto.user_phone,
        role: UserRole.PARTNER,
        partner: {
          create: {
            title: dto.title,
            description: dto.description,
            phone1: dto.phone1,
          },
        },
      },
      select: userSelect,
    });

    await this.prisma.authOtp.deleteMany({
      where: { phone: dto.user_phone },
    });

    const session = await this.userAuthService.upsertSession(user?.id, {
      fingerprint: dto.fingerprint,
      ip,
      userAgent,
    });

    const token = this.jwtService.sign({
      userId: user.id,
      sessionId: session.id,
      role: user.role,
    });

    return { token, user };
  }

  async getProfile(sessionId: string) {
    const user = await this.userService.getMe(sessionId);

    const profile = await this.prisma.partner.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      throw new NotFoundException();
    }

    return { user, profile };
  }
}
