import { ApiBearerAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';

import { CreateOrderDto } from '@/modules/orders/dto/create-order.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { OrdersService } from '@/modules/orders/orders.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  async getList(@GetUser('userId') userId: string) {
    return await this.ordersService.getList(userId);
  }

  @Get('archive')
  async getArchive(@GetUser('userId') userId: string) {
    return await this.ordersService.getArchive(userId);
  }

  @Post()
  async create(@Body() dto: CreateOrderDto, @GetUser('userId') userId: string) {
    return await this.ordersService.create(dto, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.ordersService.delete(id, userId);
  }
}
