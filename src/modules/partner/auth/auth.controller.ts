import { ApiOperation, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import {
  Body,
  Controller,
  Ip,
  Post,
  Headers,
  Get,
  UseGuards,
} from '@nestjs/common';

import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import {
  PartnerLoginRequestDto,
  PartnerLoginVerifyDto,
  PartnerRegisterRequestDto,
  PartnerRegisterVerifyDto,
} from '@/modules/partner/auth/dto/partner-auth.dto';

@Controller('auth')
export class PartnerAuthController {
  constructor(private readonly partnerAuthService: PartnerAuthService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get partner user and profile' })
  @Get('me')
  async getProfile(@GetUser('sessionId') sessionId: string) {
    return await this.partnerAuthService.getProfile(sessionId);
  }

  @Post('register/request-otp')
  @ApiOperation({ summary: 'Register request OTP' })
  async registerRequest(@Body() dto: PartnerRegisterRequestDto) {
    return await this.partnerAuthService.registerRequest(dto);
  }

  @Post('register/verify-otp')
  @ApiOperation({ summary: 'Register verify OTP' })
  @ApiHeader({
    name: 'user-agent',
    description: 'The browser or client user agent string',
    required: false,
    schema: { type: 'string' },
  })
  async registerVerify(
    @Body() dto: PartnerRegisterVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.partnerAuthService.registerVerify(dto, ip, userAgent);
  }

  @Post('login/request-otp')
  @ApiOperation({ summary: 'Login request OTP' })
  async loginRequest(@Body() dto: PartnerLoginRequestDto) {
    return await this.partnerAuthService.loginRequest(dto);
  }

  @Post('login/verify-otp')
  @ApiOperation({ summary: 'Login verify OTP' })
  @ApiHeader({
    name: 'user-agent',
    description: 'The browser or client user agent string',
    required: false,
    schema: { type: 'string' },
  })
  async loginVerify(
    @Body() dto: PartnerLoginVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.partnerAuthService.loginVerify(dto, ip, userAgent);
  }
}
