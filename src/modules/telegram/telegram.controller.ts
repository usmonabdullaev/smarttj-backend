import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrderDeliveryStatus } from '@prisma/client';

import { TelegramService } from '@/modules/telegram/telegram.service';
import { ConnectTelegramDto, UpdateTelegramOrderStatusDto } from './dto';

@ApiTags('Telegram Bot Gateway')
@Controller('telegram')
export class TelegramController {
  constructor(private readonly telegramService: TelegramService) {}

  private verifySecret(secret?: string) {
    const expectedSecret = process.env.TELEGRAM_BOT_SECRET;
    if (!expectedSecret || secret !== expectedSecret) {
      throw new UnauthorizedException('Invalid X-Bot-Secret header');
    }
  }

  @Get('profile')
  @ApiOperation({
    summary: 'Получить профиль партнёра по Telegram ID',
    description: 'Используется Python-ботом при старте диалога',
  })
  @ApiHeader({
    name: 'X-Telegram-Id',
    description: 'Telegram ID пользователя (chat_id)',
    required: true,
  })
  @ApiHeader({
    name: 'X-Bot-Secret',
    description: 'Секретный ключ бота (TELEGRAM_BOT_SECRET)',
    required: false,
  })
  async getProfile(
    @Headers('X-Telegram-Id') telegramId: string,
    @Headers('X-Bot-Secret') secret?: string,
  ) {
    this.verifySecret(secret);
    if (!telegramId) {
      throw new BadRequestException('X-Telegram-Id header is required');
    }

    return await this.telegramService.getProfile(telegramId);
  }

  @Post('connect')
  @ApiOperation({
    summary: 'Привязать Telegram ID к партнёру по одноразовому коду',
    description:
      'Вызывается Python-ботом, когда партнёр отправляет команду /start link_<CODE> или вводит код',
  })
  @ApiHeader({
    name: 'X-Bot-Secret',
    description: 'Секретный ключ бота (TELEGRAM_BOT_SECRET)',
    required: false,
  })
  async connect(
    @Body() dto: ConnectTelegramDto,
    @Headers('X-Bot-Secret') secret?: string,
  ) {
    this.verifySecret(secret);
    return await this.telegramService.connect(dto);
  }

  @Post('disconnect')
  @ApiOperation({
    summary: 'Отвязать Telegram ID партнёра (команда /disconnect в боте)',
  })
  @ApiHeader({
    name: 'X-Telegram-Id',
    description: 'Telegram ID пользователя',
    required: true,
  })
  @ApiHeader({
    name: 'X-Bot-Secret',
    description: 'Секретный ключ бота (TELEGRAM_BOT_SECRET)',
    required: false,
  })
  async disconnect(
    @Headers('X-Telegram-Id') telegramId: string,
    @Headers('X-Bot-Secret') secret?: string,
  ) {
    this.verifySecret(secret);
    if (!telegramId) {
      throw new BadRequestException('X-Telegram-Id header is required');
    }

    return await this.telegramService.disconnect(telegramId);
  }

  @Get('orders')
  @ApiOperation({
    summary: 'Список заказов партнёра для Telegram-бота',
    description: 'Позволяет партнёру в боте посмотреть последние заказы',
  })
  @ApiHeader({
    name: 'X-Telegram-Id',
    description: 'Telegram ID пользователя',
    required: true,
  })
  @ApiHeader({
    name: 'X-Bot-Secret',
    description: 'Секретный ключ бота',
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    example: 5,
    description: 'Количество заказов (по умолчанию 5)',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: OrderDeliveryStatus,
    description: 'Фильтр по статусу доставки заказа',
  })
  async getOrders(
    @Headers('X-Telegram-Id') telegramId: string,
    @Query('limit') limit?: number,
    @Query('status') status?: OrderDeliveryStatus,
    @Headers('X-Bot-Secret') secret?: string,
  ) {
    this.verifySecret(secret);
    if (!telegramId) {
      throw new BadRequestException('X-Telegram-Id header is required');
    }

    return await this.telegramService.getPartnerOrders(
      telegramId,
      Number(limit) || 5,
      status,
    );
  }

  @Get('orders/:id')
  @ApiOperation({
    summary: 'Детали заказа партнёра по ID для Telegram-бота',
  })
  @ApiHeader({
    name: 'X-Telegram-Id',
    description: 'Telegram ID пользователя',
    required: true,
  })
  @ApiHeader({
    name: 'X-Bot-Secret',
    description: 'Секретный ключ бота',
    required: false,
  })
  async getOrderDetails(
    @Headers('X-Telegram-Id') telegramId: string,
    @Param('id') id: string,
    @Headers('X-Bot-Secret') secret?: string,
  ) {
    this.verifySecret(secret);
    if (!telegramId) {
      throw new BadRequestException('X-Telegram-Id header is required');
    }

    return await this.telegramService.getPartnerOrderDetails(telegramId, id);
  }

  @Patch('orders/:id/status')
  @ApiOperation({
    summary: 'Обновить статус доставки заказа партнёра из Telegram-бота',
  })
  @ApiHeader({
    name: 'X-Telegram-Id',
    description: 'Telegram ID пользователя',
    required: true,
  })
  @ApiHeader({
    name: 'X-Bot-Secret',
    description: 'Секретный ключ бота',
    required: false,
  })
  async updateOrderStatus(
    @Headers('X-Telegram-Id') telegramId: string,
    @Param('id') id: string,
    @Body() dto: UpdateTelegramOrderStatusDto,
    @Headers('X-Bot-Secret') secret?: string,
  ) {
    this.verifySecret(secret);
    if (!telegramId) {
      throw new BadRequestException('X-Telegram-Id header is required');
    }

    return await this.telegramService.updatePartnerOrderStatus(
      telegramId,
      id,
      dto,
    );
  }
}
