import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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
  GetPartnerReviewsDto,
  PartnerReviewItemDto,
  PartnerReviewsListResponseDto,
  PartnerReviewsSummaryResponseDto,
  ReplyReviewDto,
} from './dto';
import { PartnerReviewsService } from './reviews.service';

@UseGuards(JwtAuthGuard, RolesGuard, PartnerStatusGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Reviews')
@Controller('reviews')
export class PartnerReviewsController {
  constructor(
    private readonly reviewsService: PartnerReviewsService,
    private readonly partnerAuthService: PartnerAuthService,
  ) {}

  @Get('summary')
  @ApiOperation({
    summary: 'Сводка рейтинга и распределения оценок магазина партнёра',
    description:
      'Возвращает общий средний рейтинг, количество отзывов, распределение по звёздам (1-5), топ-товары с высоким и низким рейтингом.',
  })
  @ApiOkResponse({
    type: PartnerReviewsSummaryResponseDto,
    description: 'Сводная аналитика рейтинга и отзывов',
  })
  async getSummary(@GetUser('sessionId') sessionId: string) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.reviewsService.getSummary(profile.id);
  }

  @Get()
  @ApiOperation({
    summary: 'Список отзывов на товары партнёра',
    description:
      'Поддерживает пагинацию (page, limit), фильтрацию по товару (productId), оценке (rating, minRating, maxRating), наличию текста, поиск (q), датам и сортировку.',
  })
  @ApiOkResponse({
    type: PartnerReviewsListResponseDto,
    description: 'Пагинированный список отзывов',
  })
  async getList(
    @GetUser('sessionId') sessionId: string,
    @Query() query: GetPartnerReviewsDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.reviewsService.getList(profile.id, query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Детальная информация об отзыве по ID',
    description:
      'Возвращает подробности отзыва с проверкой принадлежности товара партнёру.',
  })
  @ApiOkResponse({
    type: PartnerReviewItemDto,
    description: 'Детали отзыва',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден или не принадлежит магазину партнёра',
  })
  async getById(
    @GetUser('sessionId') sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.reviewsService.getById(profile.id, id);
  }

  @Post(':id/reply')
  @ApiOperation({
    summary: 'Ответить на отзыв покупателя',
    description:
      'Позволяет магазину опубликовать официальный ответ на отзыв покупателя.',
  })
  @ApiOkResponse({
    type: PartnerReviewItemDto,
    description: 'Отзыв с добавленным ответом продавца',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден или не принадлежит магазину партнёра',
  })
  async reply(
    @GetUser('sessionId') sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReplyReviewDto,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.reviewsService.replyToReview(profile.id, id, dto);
  }

  @Delete(':id/reply')
  @ApiOperation({
    summary: 'Удалить свой ответ на отзыв',
    description: 'Удаляет ранее оставленный ответ продавца на отзыв.',
  })
  @ApiOkResponse({
    type: PartnerReviewItemDto,
    description: 'Отзыв с удаленным ответом продавца',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден или не принадлежит магазину партнёра',
  })
  async deleteReply(
    @GetUser('sessionId') sessionId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const { profile } = await this.partnerAuthService.getProfile(sessionId);

    return await this.reviewsService.deleteReply(profile.id, id);
  }
}
