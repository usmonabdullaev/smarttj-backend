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

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { ApiErrorDto } from '@/common/dto/api-error.dto';
import {
  CheckFavoriteResponseDto,
  FavoriteIdsResponseDto,
  FavoritesListResponseDto,
  GetFavoritesDto,
  ToggleFavoriteDto,
  ToggleFavoriteResponseDto,
} from './dto';
import { FavoritesService } from './favorites.service';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Избранное (Favorites / Wishlist)')
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post('toggle')
  @ApiOperation({
    summary: 'Переключить статус товара в избранном (добавить / удалить)',
    description:
      'Универсальный эндпоинт для клика по сердечку (❤️). Если товар уже в избранном — удаляет, если нет — добавляет.',
  })
  @ApiOkResponse({
    type: ToggleFavoriteResponseDto,
    description: 'Результат переключения',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Товар не найден',
  })
  async toggle(
    @GetUser('userId') userId: string,
    @Body() dto: ToggleFavoriteDto,
  ): Promise<ToggleFavoriteResponseDto> {
    return await this.favoritesService.toggle(userId, dto);
  }

  @Post()
  @ApiOperation({
    summary: 'Добавить товар в избранное',
    description:
      'Явное добавление товара (или конкретного варианта) в список избранного.',
  })
  @ApiOkResponse({
    type: ToggleFavoriteResponseDto,
    description: 'Товар успешно добавлен',
  })
  @ApiNotFoundResponse({
    type: ApiErrorDto,
    description: 'Товар не найден',
  })
  async add(
    @GetUser('userId') userId: string,
    @Body() dto: ToggleFavoriteDto,
  ): Promise<ToggleFavoriteResponseDto> {
    return await this.favoritesService.add(userId, dto);
  }

  @Get('ids')
  @ApiOperation({
    summary: 'Список всех ID товаров в избранном у пользователя',
    description:
      'Быстрый легковесный эндпоинт, возвращает массив UUID всех товаров в избранном. Позволяет мгновенно подсветить активные сердечки в каталоге товаров.',
  })
  @ApiOkResponse({
    type: FavoriteIdsResponseDto,
    description: 'Массив UUID товаров',
  })
  async getIds(
    @GetUser('userId') userId: string,
  ): Promise<FavoriteIdsResponseDto> {
    return await this.favoritesService.getIds(userId);
  }

  @Get('check/:productId')
  @ApiOperation({
    summary: 'Проверить, находится ли товар в избранном',
    description: 'Возвращает { isFavorite: boolean } для конкретного товара.',
  })
  @ApiOkResponse({
    type: CheckFavoriteResponseDto,
    description: 'Статус наличия товара в избранном',
  })
  async check(
    @GetUser('userId') userId: string,
    @Param('productId', ParseUUIDPipe) productId: string,
  ): Promise<CheckFavoriteResponseDto> {
    return await this.favoritesService.check(userId, productId);
  }

  @Get()
  @ApiOperation({
    summary: 'Получить список избранных товаров с пагинацией',
    description:
      'Возвращает товары в избранном с актуальными ценами, скидками, остатками, категориями и изображениями для отрисовки вишлиста.',
  })
  @ApiOkResponse({
    type: FavoritesListResponseDto,
    description: 'Пагинированный список товаров в избранном',
  })
  async getList(
    @GetUser('userId') userId: string,
    @Query() query: GetFavoritesDto,
  ): Promise<FavoritesListResponseDto> {
    return await this.favoritesService.getList(userId, query);
  }

  @Delete(':productIdOrId')
  @ApiOperation({
    summary: 'Удалить товар из избранного',
    description:
      'Удаляет товар из избранного по ID товара (productId) или ID записи избранного.',
  })
  @ApiOkResponse({
    description: 'Товар удален из избранного',
  })
  async remove(
    @GetUser('userId') userId: string,
    @Param('productIdOrId') productIdOrId: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.favoritesService.remove(userId, productIdOrId);
  }

  @Delete()
  @ApiOperation({
    summary: 'Очистить весь список избранного',
    description: 'Удаляет все товары из избранного текущего пользователя.',
  })
  @ApiOkResponse({
    description: 'Список избранного очищен',
  })
  async clear(
    @GetUser('userId') userId: string,
  ): Promise<{ success: boolean; message: string }> {
    return await this.favoritesService.clear(userId);
  }
}
