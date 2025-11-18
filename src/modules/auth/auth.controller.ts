import { Controller, Post, Body, Ip, Headers } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';

import { LoginResponseDto } from './dto/login-response.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login' })
  @ApiOkResponse({ type: LoginResponseDto })
  async login(
    @Body() loginAuthDto: LoginAuthDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent?: string,
  ) {
    return await this.authService.login(loginAuthDto, ip, userAgent);
  }
}
