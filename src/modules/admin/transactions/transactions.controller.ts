import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
  AdminPaymentAttemptDto,
  AdminTransactionDto,
  AdminTransactionsSummaryDto,
  GetAdminPaymentAttemptsDto,
  GetAdminTransactionsDto,
  RefundAdminTransactionDto,
} from './dto';
import { AdminTransactionsService } from './transactions.service';

@ApiTags('Admin - Транзакции и эквайринг')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('transactions')
export class AdminTransactionsController {
  constructor(private readonly transactionsService: AdminTransactionsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить журнал всех финансовых транзакций с фильтрами и поиском',
    description:
      'Фильтрация по статусу (SUCCESS, REFUNDED), провайдеру, платежному шлюзу, датам и поиск по ID заказа/транзакции/маске карты/телефону.',
  })
  async getAll(@Query() query: GetAdminTransactionsDto) {
    return await this.transactionsService.getAll(query);
  }

  @Get('summary')
  @ApiOperation({
    summary:
      'Сводка по транзакциям (общая сумма оплат, возвратов и количество)',
  })
  @ApiOkResponse({ type: AdminTransactionsSummaryDto })
  async getSummary() {
    return await this.transactionsService.getSummary();
  }

  @Get('attempts')
  @ApiOperation({
    summary:
      'Журнал попыток оплаты (Payment Attempts / логи ошибок эквайринга)',
    description:
      'Показывает все попытки списания средств, ошибки банка (например, "Недостаточно средств") и статусы.',
  })
  @ApiOkResponse({ type: [AdminPaymentAttemptDto] })
  async getPaymentAttempts(@Query() query: GetAdminPaymentAttemptsDto) {
    return await this.transactionsService.getPaymentAttempts(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить детальную информацию о транзакции' })
  @ApiParam({ name: 'id', description: 'ID транзакции' })
  @ApiOkResponse({ type: AdminTransactionDto })
  async getById(@Param('id') id: string) {
    return await this.transactionsService.getById(id);
  }

  @Post(':id/refund')
  @ApiOperation({
    summary: 'Оформить возврат транзакции (REFUNDED)',
    description:
      'Переводит статус транзакции и связанного заказа в REFUNDED, сохраняет причину возврата.',
  })
  @ApiParam({ name: 'id', description: 'ID транзакции' })
  async refund(
    @Param('id') id: string,
    @Body() dto: RefundAdminTransactionDto,
  ) {
    return await this.transactionsService.refund(id, dto);
  }
}
