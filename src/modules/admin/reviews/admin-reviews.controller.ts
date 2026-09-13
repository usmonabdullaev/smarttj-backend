import {
  Body,
  Controller,
  Delete,
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
import { Roles } from '@/common/decorators/roles.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import { AdminReviewsService } from './admin-reviews.service';
import {
  AdminReviewItemDto,
  AdminReviewsListResponseDto,
  GetAdminReviewsDto,
  UpdateReviewStatusDto,
} from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@ApiTags('Admin / Reviews')
@Controller('reviews')
export class AdminReviewsController {
  constructor(private readonly adminReviewsService: AdminReviewsService) {}

  @Get()
  @ApiOperation({
    summary: 'Список всех отзывов платформы (модерация)',
    description:
      'Поддерживает фильтрацию по статусу (PENDING, PUBLISHED, REJECTED, HIDDEN), оценке, товару, партнёру, покупателю, поиск по тексту и сортировку.',
  })
  @ApiOkResponse({
    type: AdminReviewsListResponseDto,
    description: 'Пагинированный список отзывов',
  })
  async getList(
    @Query() query: GetAdminReviewsDto,
  ): Promise<AdminReviewsListResponseDto> {
    return await this.adminReviewsService.getList(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Детальная информация об отзыве по ID',
    description:
      'Возвращает подробности отзыва с данными покупателя, товара и магазина партнёра.',
  })
  @ApiOkResponse({
    type: AdminReviewItemDto,
    description: 'Детали отзыва',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден',
  })
  async getById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<AdminReviewItemDto> {
    return await this.adminReviewsService.getById(id);
  }

  @Patch(':id/status')
  @ApiOperation({
    summary: 'Изменить статус модерации отзыва',
    description:
      'Позволяет одобрить (PUBLISHED), отклонить (REJECTED), скрыть (HIDDEN) отзыв. Автоматически пересчитывает рейтинг товара.',
  })
  @ApiOkResponse({
    type: AdminReviewItemDto,
    description: 'Обновленный отзыв',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден',
  })
  async updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReviewStatusDto,
  ): Promise<AdminReviewItemDto> {
    return await this.adminReviewsService.updateStatus(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Удалить отзыв',
    description:
      'Удаляет спам или неприемлемый отзыв из базы данных и пересчитывает рейтинг товара.',
  })
  @ApiOkResponse({
    description: 'Отзыв успешно удален',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден',
  })
  async delete(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.adminReviewsService.delete(id);
  }
}
