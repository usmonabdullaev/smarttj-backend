import { UserRole } from '@prisma/client';
import {
  ApiOperation,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
} from '@nestjs/common';

import { PaymentMethodResponseDto } from '@/modules/payment-methods/dto/payment-method-response.dto';
import { CreatePaymentMethodDto } from '@/modules/payment-methods/dto/create-payment-method.dto';
import { UpdatePaymentMethodDto } from '@/modules/payment-methods/dto/update-payment-method.dto';
import { PaymentMethodsService } from '@/modules/payment-methods/payment-methods.service';
import { Roles } from '@/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('payment-methods')
export class PaymentMethodsController {
  constructor(private readonly paymentMethodsService: PaymentMethodsService) {}

  @Post()
  @ApiOperation({ summary: 'Create payment method' })
  @ApiCreatedResponse({ type: PaymentMethodResponseDto })
  async create(@Body() dto: CreatePaymentMethodDto) {
    return await this.paymentMethodsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get list' })
  @ApiOkResponse({ type: PaymentMethodResponseDto, isArray: true })
  async findAll() {
    return await this.paymentMethodsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get payment method' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  async findOne(@Param('id') id: string) {
    return await this.paymentMethodsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update payment method' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  async update(@Param('id') id: string, @Body() dto: UpdatePaymentMethodDto) {
    return await this.paymentMethodsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete payment method' })
  @ApiOkResponse({ type: PaymentMethodResponseDto })
  async remove(@Param('id') id: string) {
    return await this.paymentMethodsService.remove(id);
  }
}
