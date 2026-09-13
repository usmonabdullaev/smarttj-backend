import {
  Body,
  Controller,
  Delete,
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
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import {
  CreateReviewDto,
  GetProductReviewsDto,
  MyReviewsListResponseDto,
  ProductReviewsListResponseDto,
  ReviewResponseDto,
  UpdateReviewDto,
} from './dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Отзывы (Клиентская часть)')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Оставить отзыв на товар',
    description:
      'Позволяет авторизованному покупателю оставить отзыв (оценка 1-5, достоинства, недостатки, текст, фото). Автоматически проверяет факт покупки в доставленном заказе для плашки "Реальный покупатель". Ограничение: 1 отзыв на товар от одного пользователя.',
  })
  @ApiOkResponse({
    type: ReviewResponseDto,
    description: 'Отзыв успешно опубликован',
  })
  @ApiConflictResponse({
    type: ApiErrorDto,
    description: 'Пользователь уже оставил отзыв на этот товар',
  })
  async create(
    @GetUser('userId') userId: string,
    @Body() dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewsService.create(userId, dto);
  }

  @Get('product/:productId')
  @ApiOperation({
    summary: 'Получить отзывы к товару',
    description:
      'Публичный эндпоинт. Возвращает опубликованные отзывы к товару, статистику среднего рейтинга и распределение по звёздам (1-5★).',
  })
  @ApiOkResponse({
    type: ProductReviewsListResponseDto,
    description: 'Список отзывов с пагинацией и статистикой',
  })
  async getByProduct(
    @Param('productId', ParseUUIDPipe) productId: string,
    @Query() query: GetProductReviewsDto,
  ): Promise<ProductReviewsListResponseDto> {
    return await this.reviewsService.getByProduct(productId, query);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Мои отзывы',
    description:
      'Возвращает все отзывы, оставленные текущим авторизованным пользователем.',
  })
  @ApiOkResponse({
    type: MyReviewsListResponseDto,
    description: 'Список моих отзывов с пагинацией',
  })
  async getMyReviews(
    @GetUser('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<MyReviewsListResponseDto> {
    return await this.reviewsService.getMyReviews(userId, page, limit);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Редактировать свой отзыв',
    description:
      'Позволяет покупателю изменить оценку, текст или прикрепленные фотографии своего отзыва.',
  })
  @ApiOkResponse({
    type: ReviewResponseDto,
    description: 'Обновленный отзыв',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Отзыв не найден',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @GetUser('userId') userId: string,
    @Body() dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewsService.update(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Удалить свой отзыв',
    description:
      'Удаляет отзыв покупателя и пересчитывает средний рейтинг товара.',
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
    @GetUser('userId') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.reviewsService.delete(userId, id);
  }
}
