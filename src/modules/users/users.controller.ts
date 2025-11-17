import { ApiBearerAuth, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get me (current user)' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@GetUser('sessionId') sessionId: string) {
    return await this.usersService.getMe(sessionId);
  }
}
