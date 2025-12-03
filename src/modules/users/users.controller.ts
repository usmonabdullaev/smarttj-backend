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
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { GetUser } from 'src/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
}
