import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';

import { AuthService } from '@/modules/partner/auth/auth.service';
import { ApiErrorDto } from '@/common/dto/api-error.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @ApiOperation({ summary: 'Users list' })
  @ApiUnauthorizedResponse({ type: ApiErrorDto })
  async getAll() {
    return await this.authService.register();
  }
}
