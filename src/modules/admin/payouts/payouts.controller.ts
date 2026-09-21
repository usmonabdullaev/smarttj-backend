import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import {
  AdminPayoutItemDto,
  AdminPayoutsListResponseDto,
  GetAdminPayoutsDto,
  UpdatePayoutStatusDto,
} from './dto';
import { AdminPayoutsService } from './payouts.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN, UserRole.MODERATOR)
@ApiBearerAuth()
@ApiTags('Admin / Payouts')
@Controller('payouts')
export class AdminPayoutsController {
  constructor(private readonly payoutsService: AdminPayoutsService) {}

  @Get()
  @ApiOperation({
    summary: 'Список всех заявок на вывод средств',
    description:
      'Поддерживает фильтрацию по статусам (PENDING, PROCESSING, COMPLETED, REJECTED, CANCELLED), партнёру, датам, поиск по магазину, ИНН и номеру платёжки.',
  })
  @ApiOkResponse({
    type: AdminPayoutsListResponseDto,
    description: 'Пагинированный список заявок',
  })
  async getList(@Query() query: GetAdminPayoutsDto) {
    return await this.payoutsService.getList(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Детальная информация о заявке на вывод',
    description:
      'Возвращает подробности заявки, снапшот реквизитов, данные партнёра и администратора, обработавшего заявку.',
  })
  @ApiOkResponse({
    type: AdminPayoutItemDto,
    description: 'Детали заявки на вывод',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Заявка не найдена',
  })
  async getById(@Param('id', ParseUUIDPipe) id: string) {
    return await this.payoutsService.getById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Изменить статус заявки (PROCESSING, COMPLETED, REJECTED)',
    description:
      'При COMPLETED обязательно передать номер платёжного поручения (transactionReference). При REJECTED обязательно передать причину отказа (rejectReason).',
  })
  @ApiOkResponse({
    type: AdminPayoutItemDto,
    description: 'Обновленная заявка',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Заявка не найдена',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('userId') adminUserId: string,
    @Body() dto: UpdatePayoutStatusDto,
  ) {
    return await this.payoutsService.updateStatus(id, adminUserId, dto);
  }
}
