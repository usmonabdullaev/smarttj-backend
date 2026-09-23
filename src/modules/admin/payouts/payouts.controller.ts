import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
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
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  @ApiOperation({
    summary: 'Изменить статус заявки (PROCESSING, COMPLETED, REJECTED)',
    description:
      'При COMPLETED обязательно прикрепить файл чека (картинка или PDF). При REJECTED обязательно передать причину отказа (rejectReason).',
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
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return await this.payoutsService.updateStatus(id, adminUserId, dto, file);
  }

  @Get(':id/check/download')
  @ApiOperation({
    summary: 'Скачать файл чека выплаты',
    description:
      'Позволяет администратору скачать прикрепленный к выплате чек (PDF или изображение).',
  })
  @ApiParam({ name: 'id', description: 'ID заявки на выплату' })
  async downloadCheck(
    @Param('id', ParseUUIDPipe) id: string,
    @Res() res: Response,
  ) {
    return await this.payoutsService.downloadCheck(id, res);
  }
}
