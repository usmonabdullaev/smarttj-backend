import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { CreateSupportDto } from '@/modules/support/dto/create-support.dto';
import { SupportService } from '@/modules/support/support.service';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  @ApiOperation({ summary: 'Get chats list' })
  async getChats(@GetUser('userId') userId: string) {
    return await this.supportService.getChats(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Send message for USER' })
  async create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateSupportDto,
  ) {
    return await this.supportService.handleUserMessage(dto, userId);
  }
}
