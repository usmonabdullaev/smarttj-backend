import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserResponseDto } from './dto/user-response.dto';
import { ApiErrorDto } from 'src/common/dto/api-error.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get me (current user)',
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Success',
  })
  @ApiResponse({ status: 401, type: ApiErrorDto })
  async getMe(@GetUser('id') userId: string) {
    return await this.usersService.getMe(userId);
  }
}
