import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CheckoutOrderDto } from '@/modules/orders/dto/checkout-order.dto';
import { ChangePaymentMethodDto } from '@/modules/orders/dto/change-payment-method.dto';
import { CancelOrderDto } from '@/modules/orders/dto/cancel-order.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { OrdersService } from '@/modules/orders/orders.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@ApiTags('Заказы')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Получить список заказов пользователя' })
  async getList(@GetUser('userId') userId: string) {
    return await this.ordersService.getList(userId);
  }

  @Get('archive')
  @ApiOperation({ summary: 'Получить архив заказов пользователя' })
  async getArchive(@GetUser('userId') userId: string) {
    return await this.ordersService.getArchive(userId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить детальную информацию о заказе',
    description:
      'Возвращает детали заказа, товары, способ оплаты, адрес и статус транзакции.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  async getOne(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.ordersService.getById(id, userId);
  }

  @Get(':id/receipt')
  @ApiOperation({
    summary: 'Получить электронный чек заказа в JSON',
    description:
      'Возвращает структурированные данные чека (номера, даты, маску карты, состав позиций и суммы) для UI приложения.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  async getReceiptJson(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.ordersService.getReceiptJson(id, userId);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Экспорт квитанции заказа в PDF' })
  async exportPdf(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @Res() res: Response,
  ) {
    const { buffer, order } = await this.ordersService.exportReceipt(
      id,
      userId,
    );
    const createdAt = new Date(order.createdAt);
    const year = new Date(order.createdAt).getFullYear();
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const day = createdAt.getDate().toString().padStart(2, '0');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=order_${year}-${month}-${day}.pdf`,
    });

    res.send(buffer);
  }

  @Patch(':id/cancel')
  @ApiOperation({
    summary: 'Отменить заказ',
    description:
      'Отменяет заказ покупателем и возвращает количество зарезервированного товара на склад.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  async cancel(
    @Param('id') id: string,
    @GetUser('userId') userId: string,
    @Body() dto: CancelOrderDto,
  ) {
    return await this.ordersService.cancel(id, userId, dto?.reason);
  }

  @Post()
  @ApiOperation({ summary: 'Оформить заказ из корзины (Checkout)' })
  async checkout(
    @Body() dto: CheckoutOrderDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.ordersService.checkout(dto, userId);
  }

  @Patch(':id/payment-method')
  @ApiOperation({
    summary: 'Сменить способ оплаты для неоплаченного заказа',
    description:
      'Позволяет покупателю сменить способ оплаты (например, на наличные при ошибке карты), не создавая заказ заново.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  async changePaymentMethod(
    @Param('id') id: string,
    @Body() dto: ChangePaymentMethodDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.ordersService.updatePaymentMethod(
      id,
      dto.paymentMethodId,
      userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить / скрыть заказ из UI' })
  async delete(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.ordersService.delete(id, userId);
  }
}
