import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { CardsService } from './cards.service';
import { SavedCardResponseDto } from './dto';

@ApiTags('Сохраненные карты (Saved Cards)')
@Controller('cards')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get()
  @ApiOperation({
    summary: 'Получить список сохраненных карт пользователя',
    description:
      'Возвращает список активных привязанных банковских карт и кошельков текущего пользователя.',
  })
  @ApiOkResponse({
    type: [SavedCardResponseDto],
    description: 'Список сохраненных карт',
  })
  async getCards(@GetUser('userId') userId: string) {
    return await this.cardsService.getCards(userId);
  }

  @Patch(':cardId/default')
  @ApiOperation({
    summary: 'Сделать карту основной по умолчанию',
    description:
      'Назначает выбранную карту основной (дефолтной) для будущих автосписаний и оплаты в один клик.',
  })
  @ApiParam({ name: 'cardId', description: 'ID сохраненной карты' })
  @ApiOkResponse({
    type: SavedCardResponseDto,
    description: 'Обновленная карта',
  })
  async setDefaultCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.cardsService.setDefaultCard(cardId, userId);
  }

  @Delete(':cardId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Удалить (отвязать) сохраненную карту',
    description:
      'Отвязывает сохраненную карту пользователя и деактивирует её для последующих списаний.',
  })
  @ApiParam({ name: 'cardId', description: 'ID сохраненной карты' })
  @ApiOkResponse({
    description: 'Карта успешно отвязана',
    schema: {
      example: {
        success: true,
        message: 'Карта успешно удалена',
      },
    },
  })
  async deleteCard(
    @Param('cardId', ParseUUIDPipe) cardId: string,
    @GetUser('userId') userId: string,
  ) {
    return await this.cardsService.deleteCard(cardId, userId);
  }
}
