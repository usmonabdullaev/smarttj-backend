import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import { PartnerOrdersService } from './orders.service';
import {
  GetPartnerOrdersDto,
  UpdateOrderDeliveryStatusDto,
  UpdateOrderItemDeliveryStatusDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Orders')
@Controller('orders')
export class PartnerOrdersController {
  constructor(
    private readonly ordersService: PartnerOrdersService,
    private readonly partnerAuthService: PartnerAuthService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список заказов с товарами партнёра',
    description:
      'Поддерживает фильтрацию по статусам заказа и позиций, способу оплаты, типу заказа, датам, поиску и пагинацию.',
  })
  async getList(
    @GetUser('sessionId') sessionId: string,
    @Query() query: GetPartnerOrdersDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.ordersService.getList(profile.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить детали заказа по ID',
    description:
      'Возвращает заказ с товарами данного партнёра, информацией о покупателе и доставке.',
  })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async getById(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.ordersService.getById(id, profile.id);
  }

  @Patch(':orderId/items/:itemId/delivery-status')
  @ApiOperation({
    summary: 'Обновить статус доставки конкретного товара партнёра в заказе',
  })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async updateItemDeliveryStatus(
    @Param('orderId') orderId: string,
    @Param('itemId') itemId: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: UpdateOrderItemDeliveryStatusDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.ordersService.updateItemDeliveryStatus(
      orderId,
      itemId,
      profile.id,
      dto,
    );
  }

  @Patch(':id/delivery-status')
  @ApiOperation({
    summary: 'Обновить статус доставки всех товаров партнёра в заказе',
  })
  @ApiNotFoundResponse({ type: ApiErrorDto })
  async updateOrderDeliveryStatus(
    @Param('id') id: string,
    @GetUser('sessionId') sessionId: string,
    @Body() dto: UpdateOrderDeliveryStatusDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.ordersService.updateOrderDeliveryStatus(
      id,
      profile.id,
      dto,
    );
  }
}
