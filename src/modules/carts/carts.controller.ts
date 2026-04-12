import { ApiBearerAuth } from '@nestjs/swagger';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';

import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateCartDto } from './dto/create-cart.dto';
import { EditCartDto } from './dto/edit-cart.dto';
import { CartsService } from './carts.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('carts')
export class CartsController {
  constructor(private readonly cartsService: CartsService) {}

  @Get()
  async getList(@GetUser('userId') userId: string) {
    return await this.cartsService.getList(userId);
  }

  @Post()
  async create(@Body() dto: CreateCartDto, @GetUser('userId') userId: string) {
    return await this.cartsService.create(dto, userId);
  }

  @Patch(':id')
  async edit(
    @Param('id') id: string,
    @Body() dto: EditCartDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.cartsService.edit(dto, id, userId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @GetUser('userId') userId: string) {
    return await this.cartsService.delete(id, userId);
  }
}
