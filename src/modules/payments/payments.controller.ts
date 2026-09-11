import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import {
  AlifCallbackRequest,
  CancelPaymentRequest,
  InitPaymentRequest,
  SimulatePaymentRequest,
} from './dto';
import { PaymentsService } from './payments.service';

@ApiTags('Платежи (Alif Acquiring)')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('alif/init')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Инициализация онлайн-платежа через Alif Acquiring',
    description:
      'Создает ссылку для перенаправления покупателя на защищенную платежную форму Alif (WebCheckout).',
  })
  @ApiResponse({
    status: 201,
    description: 'Ссылка на оплату успешно получена',
  })
  async initAlifPayment(
    @Body() dto: InitPaymentRequest,
    @GetUser('userId') userId: string,
  ) {
    return await this.paymentsService.initAlifPayment(dto, userId);
  }

  @Post('alif/callback')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Вебхук (callback) от Alif Acquiring',
    description:
      'Публичный эндпоинт для автоматического приёма уведомлений от платежного шлюза Alif.',
  })
  @ApiResponse({ status: 200, description: 'Callback успешно обработан' })
  async alifCallback(@Body() dto: AlifCallbackRequest) {
    return await this.paymentsService.handleCallback(dto);
  }

  @Get('alif/check/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Проверка статуса платежа в Alif Acquiring',
    description:
      'Запрашивает актуальный статус транзакции напрямую у Alif (/checktxn) и синхронизирует состояние заказа.',
  })
  @ApiParam({ name: 'orderId', description: 'ID заказа в SmartTJ' })
  async checkAlifStatus(
    @Param('orderId') orderId: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.paymentsService.checkPaymentStatus(orderId, userId);
  }

  @Get('status/:orderId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить статус оплаты заказа для фронтенда (Result Screen)',
    description:
      'Возвращает статус оплаты, метод оплаты, детали транзакции и данные последней попытки для страницы результата чекаута.',
  })
  @ApiParam({ name: 'orderId', description: 'ID заказа в SmartTJ' })
  async getOrderPaymentStatus(
    @Param('orderId') orderId: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.paymentsService.getOrderPaymentStatus(orderId, userId);
  }

  @Post('alif/simulate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Тестовая эмуляция callback от Alif (для фронтенд-тестирования)',
    description:
      'Позволяет фронтенду мгновенно имитировать статус оплаты (ok, failed, canceled) с валидной подписью без реального проведения платежа.',
  })
  async simulatePayment(
    @Body() dto: SimulatePaymentRequest,
    @GetUser('userId') userId: string,
  ) {
    return await this.paymentsService.simulateCallback(dto, userId);
  }

  @Post('alif/cancel')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Отмена платежа в Alif Acquiring (/cancel/standard)',
    description:
      'Производит возврат / отмену успешного платежа через сервис Alif.',
  })
  async cancelPayment(
    @Body() dto: CancelPaymentRequest,
    @GetUser('userId') userId: string,
  ) {
    return await this.paymentsService.cancelPayment(dto, userId);
  }

  @Get('cards')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Получить список сохраненных карт пользователя',
  })
  async getSavedCards(@GetUser('userId') userId: string) {
    return await this.paymentsService.getSavedCards(userId);
  }

  @Delete('cards/:cardId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить сохраненную карту',
  })
  @ApiParam({ name: 'cardId', description: 'ID сохраненной карты' })
  async deleteSavedCard(
    @Param('cardId') cardId: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.paymentsService.deleteSavedCard(cardId, userId);
  }
}
