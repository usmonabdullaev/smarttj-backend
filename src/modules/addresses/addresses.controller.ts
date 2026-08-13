import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { AddressesService } from './addresses.service';
import { CreateRequest } from './dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'Get user addresses' })
  async getList(@GetUser('userId') userId: string) {
    return await this.addressesService.getList(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user address' })
  async getById(@Param('id') id: string) {
    return await this.addressesService.getById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  async create(@GetUser('userId') userId: string, @Body() dto: CreateRequest) {
    return await this.addressesService.create(userId, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  async remove(@Param('id') id: string) {
    return await this.addressesService.remove(id);
  }
}
