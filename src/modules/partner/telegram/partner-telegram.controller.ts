import { Controller, Delete, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { PartnerTelegramService } from './partner-telegram.service';
import { TelegramLinkCodeResponseDto, TelegramStatusResponseDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Telegram')
@Controller('telegram')
export class PartnerTelegramController {
  constructor(
    private readonly partnerTelegramService: PartnerTelegramService,
    private readonly partnerAuthService: PartnerAuthService,
  ) {}

  @Get('status')
  @ApiOperation({
    summary: 'Проверить статус привязки Telegram-бота к партнёру',
  })
  @ApiOkResponse({ type: TelegramStatusResponseDto })
  async getStatus(@GetUser('userId') userId: string) {
    return await this.partnerTelegramService.getStatus(userId);
  }

  @Post('link-code')
  @ApiOperation({
    summary:
      'Сгенерировать код и прямую ссылку для привязки Telegram-бота к аккаунту партнёра',
  })
  @ApiOkResponse({ type: TelegramLinkCodeResponseDto })
  async generateLinkCode(
    @GetUser('userId') userId: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);
    return await this.partnerTelegramService.generateLinkCode(
      userId,
      profile.id,
    );
  }

  @Delete()
  @ApiOperation({
    summary: 'Отвязать Telegram-аккаунт партнёра от бота',
  })
  async disconnect(@GetUser('userId') userId: string) {
    return await this.partnerTelegramService.disconnect(userId);
  }
}
