import {
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiConsumes,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Express } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

import { GetUser } from '../../common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';
import { CloudinaryService } from '../../cloudinary/cloudinary.service';
import { SetPasswordDto, UpdateUserDto } from './dto/update-user.dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly cloudinary: CloudinaryService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user' })
  @ApiOkResponse({ type: UserResponseDto })
  async getMe(@GetUser('sessionId') sessionId: string) {
    return await this.usersService.getMe(sessionId);
  }

  @Put()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update current user' })
  @ApiOkResponse({ type: UserResponseDto })
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @GetUser('userId') userId: string,
    @Body() dto: UpdateUserDto,
    @UploadedFile() avatar: Express.Multer.File,
  ) {
    const upload = avatar
      ? await this.cloudinary.uploadFile(avatar, 'avatar')
      : null;

    return this.usersService.update(
      userId,
      {
        ...dto,
        avatar: upload?.secure_url,
      },
      upload?.public_id,
    );
  }

  @Post('set-password')
  async setPassword(
    @Body() dto: SetPasswordDto,
    @GetUser('userId') userId: string,
    @GetUser('sessionId') sessionId: string,
  ) {
    return await this.usersService.setPassword(dto, userId, sessionId);
  }
}
