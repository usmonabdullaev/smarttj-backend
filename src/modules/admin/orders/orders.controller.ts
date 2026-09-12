import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import type { Response } from 'express';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  AdminOrderDto,
  AdminOrderListResponseDto,
  CancelAdminOrderDto,
  GetAdminOrdersDto,
  UpdateAdminOrderStatusDto,
  UpdateAdminPaymentStatusDto,
} from './dto';
import { AdminOrdersService } from './orders.service';

@ApiTags('Admin - Заказы')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('orders')
export class AdminOrdersController {
  constructor(private readonly ordersService: AdminOrdersService) {}

  @Get()
  @ApiOperation({
    summary:
      'Получить список всех заказов платформы с фильтрацией и пагинацией',
  })
  @ApiOkResponse({ type: AdminOrderListResponseDto })
  async getAll(@Query() query: GetAdminOrdersDto) {
    return await this.ordersService.getAll(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить полную детальную информацию о заказе',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  @ApiOkResponse({ type: AdminOrderDto })
  async getById(@Param('id') id: string) {
    return await this.ordersService.getById(id);
  }

  @Patch(':id/delivery-status')
  @ApiOperation({
    summary: 'Обновить статус доставки заказа',
    description:
      'Обновляет статус доставки заказа. Если статус переводится в RECEIVED, у всех позиций также проставляется RECEIVED и время получения receivedAt.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  @ApiOkResponse({ type: AdminOrderDto })
  async updateDeliveryStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminOrderStatusDto,
  ) {
    return await this.ordersService.updateDeliveryStatus(id, dto);
  }

  @Patch(':id/payment-status')
  @ApiOperation({
    summary: 'Обновить статус оплаты заказа',
    description:
      'Обновляет статус оплаты заказа. Если статус переводится в PAID, фиксируется дата фактической оплаты paidAt.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  @ApiOkResponse({ type: AdminOrderDto })
  async updatePaymentStatus(
    @Param('id') id: string,
    @Body() dto: UpdateAdminPaymentStatusDto,
  ) {
    return await this.ordersService.updatePaymentStatus(id, dto);
  }

  @Post(':id/cancel')
  @ApiOperation({
    summary: 'Отменить заказ администратором с обязательной причиной',
    description:
      'Отменяет заказ, сохраняет причину отмены, переводит статус заказа в архив и возвращает количество зарезервированного товара на склад.',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  async cancel(@Param('id') id: string, @Body() dto: CancelAdminOrderDto) {
    return await this.ordersService.cancel(id, dto);
  }

  @Get(':id/receipt')
  @ApiOperation({
    summary: 'Сгенерировать и скачать официальный PDF-чек заказа',
  })
  @ApiParam({ name: 'id', description: 'ID заказа' })
  async downloadReceipt(@Param('id') id: string, @Res() res: Response) {
    const { buffer, order } = await this.ordersService.exportReceipt(id);
    const createdAt = new Date(order.createdAt);
    const year = createdAt.getFullYear();
    const month = (createdAt.getMonth() + 1).toString().padStart(2, '0');
    const day = createdAt.getDate().toString().padStart(2, '0');

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=order_${id}_${year}-${month}-${day}.pdf`,
    });

    res.send(buffer);
  }
}
