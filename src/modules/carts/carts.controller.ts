import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
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

import { AddToCartDto } from '@/modules/carts/dto/add-to-cart.dto';
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
  @ApiOperation({ summary: 'Get user cart' })
  async getCart(@GetUser('userId') userId: string) {
    return await this.cartsService.getCart(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Add product variant to cart' })
  async addToCart(
    @Body() dto: AddToCartDto,
    @GetUser('userId') userId: string,
  ) {
    return await this.cartsService.addToCart(dto, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit cart item' })
  async edit(@Param('id') id: string, @Body() dto: EditCartDto) {
    return await this.cartsService.edit(dto, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete cart item' })
  async deleteItem(@Param('id') id: string) {
    return await this.cartsService.deleteItem(id);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  async clear(@GetUser('userId') userId: string) {
    return await this.cartsService.clear(userId);
  }
}
