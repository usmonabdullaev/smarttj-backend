import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
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
