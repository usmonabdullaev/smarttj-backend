import { UserRole } from '@prisma/client';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';

import { PaymentMethodResponseDto } from '@/modules/payment-methods/dto/payment-method-response.dto';
import { CreatePaymentMethodDto } from '@/modules/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/modules/payment-methods/dto/update-payment-method.dto';
import { PaymentMethodsService } from '@/modules/payment-methods/payment-methods.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@ApiTags('Способы оплаты')
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список способов оплаты (для чекаута и клиентов)',
    description:
      'Возвращает доступные способы оплаты. По умолчанию возвращает только активные (active=true).',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Фильтровать только активные (по умолчанию true)',
  })
  @ApiOkResponse({ type: PaymentMethodResponseDto, isArray: true })
  async findAll(@Query('activeOnly') activeOnly?: string) {
    const isFiltered = activeOnly !== undefined ? activeOnly === 'true' : true;
    return await this.paymentMethodsService.findAll(isFiltered);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить способ оплаты по ID' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  async findOne(@Param('id') id: string) {
    return await this.paymentMethodsService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Создать способ оплаты (только ADMIN)' })
  @ApiCreatedResponse({ type: PaymentMethodResponseDto })
  async create(@Body() dto: CreatePaymentMethodDto) {
    return await this.paymentMethodsService.create(dto);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Обновить способ оплаты (только ADMIN)' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return await this.paymentMethodsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Удалить способ оплаты (только ADMIN)' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  async remove(@Param('id') id: string) {
    return await this.paymentMethodsService.remove(id);
  }
}
