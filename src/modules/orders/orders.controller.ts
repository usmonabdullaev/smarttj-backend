import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CheckoutOrderDto } from '@/modules/orders/dto/checkout-order.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { OrdersService } from '@/modules/orders/orders.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @ApiOperation({ summary: 'Get user orders' })
  async getList(@GetUser('userId') userId: string) {
    return await this.ordersService.getList(userId);
  }

  @Get('archive')
  @ApiOperation({ summary: 'Get archived orders' })
  async getArchive(@GetUser('userId') userId: string) {
    return await this.ordersService.getArchive(userId);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Export order receipt in PDF' })
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, order } = await this.ordersService.exportReceipt(id);
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

  @Post()
  @ApiOperation({ summary: 'Checkout' })
  async checkout(
    @Body() dto: CheckoutOrderDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.ordersService.checkout(dto, userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete order for UI' })
  async delete(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.ordersService.delete(id, userId);
  }
}
