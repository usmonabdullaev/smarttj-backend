import { Controller, Post, Body, UseGuards, Get } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateSupportDto } from './dto/create-support.dto';
import { SupportService } from './support.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('support')
export class SupportController {
  constructor(private readonly supportService: SupportService) {}

  @Get()
  async getChats(@GetUser('userId') userId: string) {
    return await this.supportService.getChats(userId);
  }

  @Post()
  async create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateSupportDto,
  ) {
    return await this.supportService.handleUserMessage(dto, userId);
  }
}
