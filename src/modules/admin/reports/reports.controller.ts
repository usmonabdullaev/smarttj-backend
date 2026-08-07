import { Controller, Get, Param, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Response } from 'express';

import { AdminReportsService } from 'src/modules/admin/reports/reports.service';
import { GetReportsDto } from '@/modules/admin/reports/dto/get-reports.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { RolesGuard } from '@/auth/guards/roles.guard';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SYSADMIN, UserRole.ADMIN)
@ApiBearerAuth()
@Controller('reports')
export class AdminReportsController {
  constructor(private readonly reportsService: AdminReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Get reports list' })
  async getList(@Query() dto: GetReportsDto) {
    return await this.reportsService.getList(dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report by ID' })
  async getById(@Param('id') id: string) {
    return await this.reportsService.getById(id);
  }

  @Get(':id/pdf')
  @ApiOperation({ summary: 'Export report in PDF' })
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, report } = await this.reportsService.exportPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report_${report.year}-${report.month}.pdf`,
    });

    res.send(buffer);
  }
}
