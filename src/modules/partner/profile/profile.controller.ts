import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';

import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { GetUser } from '@/common/decorators/get-user.decorator';
import { Roles } from '@/common/decorators/roles.decorator';
import { PartnerProfileService } from './profile.service';
import { UpdatePartnerProfileDto } from './dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PARTNER)
@ApiBearerAuth()
@ApiTags('Partner / Profile')
@Controller('profile')
export class PartnerProfileController {
  constructor(private readonly partnerProfileService: PartnerProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Получить профиль партнёра' })
  async getProfile(@GetUser('userId') userId: string) {
    return await this.partnerProfileService.getProfile(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Обновить данные профиля партнёра' })
  async updateProfile(
    @GetUser('userId') userId: string,
    @Body() dto: UpdatePartnerProfileDto,
  ) {
    return await this.partnerProfileService.updateProfile(userId, dto);
  }

  @Post('logo')
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Загрузить или обновить логотип партнёра' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: {
          type: 'string',
          format: 'binary',
          description: 'Файл логотипа (jpeg, png, webp, avif)',
        },
      },
      required: ['logo'],
    },
  })
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @GetUser('userId') userId: string,
    @UploadedFile() logo?: Express.Multer.File,
  ) {
    return await this.partnerProfileService.uploadLogo(userId, logo);
  }

  @Delete('logo')
  @ApiOperation({ summary: 'Удалить логотип партнёра' })
  async deleteLogo(@GetUser('userId') userId: string) {
    return await this.partnerProfileService.deleteLogo(userId);
  }
}
