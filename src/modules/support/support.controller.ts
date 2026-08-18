import { Controller, Post, Body, UseGuards, Get, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { SupportService } from '@/modules/support/support.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import {
  CreateSupportDto,
  SendMessageDto,
} from '@/modules/support/dto/create-support.dto';

@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Sse('events')
  @ApiOperation({ summary: 'SSE for messages' })
  @ApiOkResponse({
    content: {
      'text/event-stream': {
        schema: {
          type: 'object',
        },
      },
    },
  })
  events() {
    return this.supportService.getEvents();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get()
  @ApiOperation({ summary: 'Get chats list' })
  async getChats(@GetUser('userId') userId: string) {
    return await this.supportService.getChats(userId);
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Post()
  @ApiOperation({ summary: 'Send message for USER' })
  async create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateSupportDto,
  ) {
    return await this.supportService.handleUserMessage(dto, userId);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.SYSADMIN, UserRole.MODERATOR)
  @ApiBearerAuth()
  @Post('send')
  @ApiOperation({ summary: 'Send message for OPERATOR' })
  async send(@Body() dto: SendMessageDto) {
    return await this.supportService.sendMessage(dto);
  }
}
