import { ApiOperation, ApiOkResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SessionsService } from './sessions.service';
import {
  SessionsResponseDto,
  SessionResponseDto,
} from './dto/session-response.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('sessions')
export class SessionsController {
  constructor(private readonly sessionsService: SessionsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user sessions' })
  @ApiOkResponse({ type: SessionsResponseDto, isArray: true })
  async findAll(
    @GetUser('userId') userId: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    return await this.sessionsService.findAll(userId, sessionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove session' })
  @ApiOkResponse({ type: SessionResponseDto })
  async remove(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    return await this.sessionsService.remove(id, sessionId);
  }
}
