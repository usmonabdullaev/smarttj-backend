import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';

import { ServerService } from './server.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('server')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(UserRole.SYSADMIN)
  @Get('info')
  @ApiOperation({ summary: 'Get info' })
  async info() {
    return await this.serverService.info();
  }

  @Get('status')
  @ApiOperation({ summary: 'Get status' })
  async status() {
    return await this.serverService.status();
  }
}
