import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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

import { JwtAuthGuard, RolesGuard, PartnerStatusGuard } from '@/auth/guards';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { PartnerAuthService } from '@/modules/partner/auth/auth.service';
import {
  CreatePayoutRequestDto,
  GetPartnerOperationsDto,
  GetPartnerPayoutsDto,
  PartnerFinancesSummaryResponseDto,
  PartnerOperationsListResponseDto,
  PartnerPayoutsListResponseDto,
  PartnerRequisitesResponseDto,
  PayoutRequestItemDto,
  UpdatePartnerRequisitesDto,
} from './dto';
import { PartnerFinancesService } from './finances.service';

@UseGuards(JwtAuthGuard, RolesGuard, PartnerStatusGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Finances')
@Controller('finances')
export class PartnerFinancesController {
  constructor(
    private readonly financesService: PartnerFinancesService,
    private readonly partnerAuthService: PartnerAuthService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Финансовая сводка и состояние баланса выплат',
    description:
      'Возвращает доступные к выплате средства, холд на этапе доставки, резерв в заявках, выплаченную сумму, комиссию площадки, месячную статистику и статус реквизитов.',
  })
  @ApiOkResponse({
    type: PartnerFinancesSummaryResponseDto,
    description: 'Финансовая сводка магазина партнёра',
  })
  async getSummary(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.getSummary(profile.id);
  }

  @Post('withdraw')
  @ApiOperation({
    summary: 'Подать заявку на вывод средств с баланса',
    description:
      'Создает заявку со статусом PENDING. Сумма замораживается на балансе партнёра и резервируется под выплату.',
  })
  @ApiOkResponse({
    type: PayoutRequestItemDto,
    description: 'Созданная заявка на вывод средств',
  })
  async withdraw(
    @GetUser('sessionId') sessionId: string,
    @Body() dto: CreatePayoutRequestDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.withdraw(profile.id, dto);
  }

  @Get('payouts')
  @ApiOperation({
    summary: 'История заявок на вывод средств',
    description:
      'Пагинированный список всех поданных заявок на вывод со статусами (PENDING, PROCESSING, COMPLETED, REJECTED, CANCELLED).',
  })
  @ApiOkResponse({
    type: PartnerPayoutsListResponseDto,
    description: 'Список заявок на выплату',
  })
  async getPayouts(
    @GetUser('sessionId') sessionId: string,
    @Query() query: GetPartnerPayoutsDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.getPayouts(profile.id, query);
  }

  @Post('payouts/:id/cancel')
  @ApiOperation({
    summary: 'Отменить заявку на вывод средств',
    description:
      'Отмена доступна только для заявок в статусе PENDING. Сумма мгновенно возвращается в доступный баланс.',
  })
  @ApiOkResponse({
    type: PayoutRequestItemDto,
    description: 'Отмененная заявка',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Заявка не найдена',
  })
  async cancelPayout(
    @GetUser('sessionId') sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.cancelPayout(profile.id, id);
  }

  @Get('requisites')
  @ApiOperation({
    summary: 'Получить реквизиты выплат партнера',
    description:
      'Возвращает текущие реквизиты: ИНН, расчетный счет IBAN, банк, БИК, карту Корти Милли и Alif терминал.',
  })
  @ApiOkResponse({
    type: PartnerRequisitesResponseDto,
    description: 'Платежные реквизиты партнера',
  })
  async getRequisites(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.getRequisites(profile.id);
  }

  @Patch('requisites')
  @ApiOperation({
    summary: 'Обновить реквизиты выплат партнера',
    description:
      'Позволяет указать или обновить ИНН, наименование банка, расчетный счет, БИК, карту или терминал.',
  })
  @ApiOkResponse({
    type: PartnerRequisitesResponseDto,
    description: 'Обновленные платежные реквизиты',
  })
  async updateRequisites(
    @GetUser('sessionId') sessionId: string,
    @Body() dto: UpdatePartnerRequisitesDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.updateRequisites(profile.id, dto);
  }

  @Get('operations')
  @ApiOperation({
    summary: 'Журнал начислений и финансовых операций',
    description:
      'Позиции оплаченных заказов с информацией о сумме, комиссии маркетплейса, чистой выплате, статусе доставки и готовности к выводу.',
  })
  @ApiOkResponse({
    type: PartnerOperationsListResponseDto,
    description: 'Пагинированный журнал начислений',
  })
  async getOperations(
    @GetUser('sessionId') sessionId: string,
    @Query() query: GetPartnerOperationsDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.financesService.getOperations(profile.id, query);
  }
}
