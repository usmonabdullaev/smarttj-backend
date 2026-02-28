import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';

import { OrdersService } from './orders.service';
import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOrderDto } from './dto/create-order.dto';

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
