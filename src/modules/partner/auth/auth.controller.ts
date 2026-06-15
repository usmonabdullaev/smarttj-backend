import { ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
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

import { AuthService } from '@/modules/partner/auth/auth.service';
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
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PARTNER)
  @ApiBearerAuth()
  @Get('me')
  async getProfile(@GetUser('sessionId') sessionId: string) {
    return await this.authService.getProfile(sessionId);
  }

  @Post('register/request-otp')
  @ApiOperation({ summary: 'Register request OTP' })
  async registerRequest(@Body() dto: PartnerRegisterRequestDto) {
    return await this.authService.registerRequest(dto);
  }

  @Post('register/verify-otp')
  @ApiOperation({ summary: 'Register verify OTP' })
  async registerVerify(
    @Body() dto: PartnerRegisterVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.registerVerify(dto, ip, userAgent);
  }

  @Post('login/request-otp')
  @ApiOperation({ summary: 'Login request OTP' })
  async loginRequest(@Body() dto: PartnerLoginRequestDto) {
    return await this.authService.loginRequest(dto);
  }

  @Post('login/verify-otp')
  @ApiOperation({ summary: 'Login verify OTP' })
  async loginVerify(
    @Body() dto: PartnerLoginVerifyDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.loginVerify(dto, ip, userAgent);
  }
}
