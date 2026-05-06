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

import { CreateCartDto } from '@/modules/carts/dto/create-cart.dto';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { EditCartDto } from '@/modules/carts/dto/edit-cart.dto';
import { CartsService } from '@/modules/carts/carts.service';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

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
