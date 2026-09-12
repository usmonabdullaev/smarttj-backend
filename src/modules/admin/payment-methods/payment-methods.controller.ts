import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import {
  AdminCreatePaymentMethodDto,
  AdminPaymentMethodResponseDto,
  AdminUpdatePaymentMethodDto,
} from './dto';
import { AdminPaymentMethodsService } from './payment-methods.service';

@ApiTags('Admin - Способы оплаты')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('payment-methods')
export class AdminPaymentMethodsController {
  constructor(
    private readonly paymentMethodsService: AdminPaymentMethodsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Получить все способы оплаты с количеством привязанных заказов',
  })
  @ApiOkResponse({ type: [AdminPaymentMethodResponseDto] })
  async getAll() {
    return await this.paymentMethodsService.getAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить способ оплаты по ID' })
  @ApiParam({ name: 'id', description: 'ID способа оплаты' })
  @ApiOkResponse({ type: AdminPaymentMethodResponseDto })
  async getById(@Param('id') id: string) {
    return await this.paymentMethodsService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новый способ оплаты' })
  @ApiCreatedResponse({ type: AdminPaymentMethodResponseDto })
  async create(@Body() dto: AdminCreatePaymentMethodDto) {
    return await this.paymentMethodsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить способ оплаты' })
  @ApiParam({ name: 'id', description: 'ID способа оплаты' })
  @ApiOkResponse({ type: AdminPaymentMethodResponseDto })
  async update(
    @Param('id') id: string,
    @Body() dto: AdminUpdatePaymentMethodDto,
  ) {
    return await this.paymentMethodsService.update(id, dto);
  }

  @Patch(':id/toggle')
  @ApiOperation({
    summary:
      'Быстро переключить активность способа оплаты (isActive: true/false)',
  })
  @ApiParam({ name: 'id', description: 'ID способа оплаты' })
  @ApiOkResponse({ type: AdminPaymentMethodResponseDto })
  async toggle(@Param('id') id: string) {
    return await this.paymentMethodsService.toggle(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Удалить способ оплаты (заблокировано, если есть привязанные заказы)',
  })
  @ApiParam({ name: 'id', description: 'ID способа оплаты' })
  async delete(@Param('id') id: string) {
    return await this.paymentMethodsService.delete(id);
  }
}
