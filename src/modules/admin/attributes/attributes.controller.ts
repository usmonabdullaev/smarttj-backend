import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
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
  AttributeGroupResponseDto,
  AttributeResponseDto,
  AttributeValueResponseDto,
  CreateAdminAttributeDto,
  CreateAttributeGroupDto,
  CreateAttributeValueDto,
  GetAdminAttributesDto,
  UpdateAdminAttributeDto,
  UpdateAttributeGroupDto,
  UpdateAttributeValueDto,
} from './dto';
import { AdminAttributesService } from './attributes.service';

@ApiTags('Admin - Характеристики товаров (Атрибуты)')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('attributes')
export class AdminAttributesController {
  constructor(private readonly attributesService: AdminAttributesService) {}

  // ----------------------------------------------------
  // ГРУППЫ ХАРАКТЕРИСТИК (AttributeGroup)
  // ----------------------------------------------------

  @Get('groups')
  @ApiOperation({ summary: 'Получить список всех групп характеристик' })
  @ApiOkResponse({ type: [AttributeGroupResponseDto] })
  async getGroups() {
    return await this.attributesService.getGroups();
  }

  @Post('groups')
  @ApiOperation({ summary: 'Создать новую группу характеристик' })
  @ApiCreatedResponse({ type: AttributeGroupResponseDto })
  async createGroup(@Body() dto: CreateAttributeGroupDto) {
    return await this.attributesService.createGroup(dto);
  }

  @Get('groups/:id')
  @ApiOperation({
    summary: 'Получить группу характеристик по ID с привязанными атрибутами',
  })
  @ApiParam({ name: 'id', description: 'ID группы' })
  @ApiOkResponse({ type: AttributeGroupResponseDto })
  async getGroupById(@Param('id') id: string) {
    return await this.attributesService.getGroupById(id);
  }

  @Put('groups/:id')
  @ApiOperation({ summary: 'Обновить группу характеристик' })
  @ApiParam({ name: 'id', description: 'ID группы' })
  @ApiOkResponse({ type: AttributeGroupResponseDto })
  async updateGroup(
    @Param('id') id: string,
    @Body() dto: UpdateAttributeGroupDto,
  ) {
    return await this.attributesService.updateGroup(id, dto);
  }

  @Delete('groups/:id')
  @ApiOperation({
    summary:
      'Удалить группу характеристик (заблокировано, если в ней есть атрибуты)',
  })
  @ApiParam({ name: 'id', description: 'ID группы' })
  async deleteGroup(@Param('id') id: string) {
    return await this.attributesService.deleteGroup(id);
  }

  // ----------------------------------------------------
  // ЗНАЧЕНИЯ ХАРАКТЕРИСТИК (AttributeValue)
  // ----------------------------------------------------

  @Get(':id/values')
  @ApiOperation({ summary: 'Получить все значения конкретной характеристики' })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  @ApiOkResponse({ type: [AttributeValueResponseDto] })
  async getValues(@Param('id') id: string) {
    return await this.attributesService.getValues(id);
  }

  @Post(':id/values')
  @ApiOperation({ summary: 'Добавить значение для характеристики' })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  @ApiCreatedResponse({ type: AttributeValueResponseDto })
  async createValue(
    @Param('id') id: string,
    @Body() dto: CreateAttributeValueDto,
  ) {
    return await this.attributesService.createValue(id, dto);
  }

  @Put(':id/values/:valueId')
  @ApiOperation({ summary: 'Обновить значение характеристики' })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  @ApiParam({ name: 'valueId', description: 'ID значения' })
  @ApiOkResponse({ type: AttributeValueResponseDto })
  async updateValue(
    @Param('id') id: string,
    @Param('valueId') valueId: string,
    @Body() dto: UpdateAttributeValueDto,
  ) {
    return await this.attributesService.updateValue(id, valueId, dto);
  }

  @Delete(':id/values/:valueId')
  @ApiOperation({
    summary:
      'Удалить значение характеристики (заблокировано, если используется в товарах)',
  })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  @ApiParam({ name: 'valueId', description: 'ID значения' })
  async deleteValue(
    @Param('id') id: string,
    @Param('valueId') valueId: string,
  ) {
    return await this.attributesService.deleteValue(id, valueId);
  }

  // ----------------------------------------------------
  // ХАРАКТЕРИСТИКИ / АТРИБУТЫ (Attribute)
  // ----------------------------------------------------

  @Get()
  @ApiOperation({
    summary:
      'Получить список всех характеристик с фильтрами по категории, группе и типу',
  })
  @ApiOkResponse({ type: [AttributeResponseDto] })
  async getAttributes(@Query() query: GetAdminAttributesDto) {
    return await this.attributesService.getAttributes(query);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Получить характеристику по ID со всеми значениями',
  })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  @ApiOkResponse({ type: AttributeResponseDto })
  async getAttributeById(@Param('id') id: string) {
    return await this.attributesService.getAttributeById(id);
  }

  @Post()
  @ApiOperation({
    summary: 'Создать характеристику (с опциональными начальными значениями)',
  })
  @ApiCreatedResponse({ type: AttributeResponseDto })
  async createAttribute(@Body() dto: CreateAdminAttributeDto) {
    return await this.attributesService.createAttribute(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить характеристику' })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  @ApiOkResponse({ type: AttributeResponseDto })
  async updateAttribute(
    @Param('id') id: string,
    @Body() dto: UpdateAdminAttributeDto,
  ) {
    return await this.attributesService.updateAttribute(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Удалить характеристику (заблокировано, если привязана к товарам каталога)',
  })
  @ApiParam({ name: 'id', description: 'ID характеристики' })
  async deleteAttribute(@Param('id') id: string) {
    return await this.attributesService.deleteAttribute(id);
  }
}
