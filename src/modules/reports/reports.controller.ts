import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { Response } from 'express';

import { GetReportsDto } from './dto/get-reports.dto';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async getList(@Query() dto: GetReportsDto) {
    return await this.reportsService.getList(dto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return await this.reportsService.getById(id);
  }

  @Get(':id/pdf')
  async exportPdf(@Param('id') id: string, @Res() res: Response) {
    const { buffer, report } = await this.reportsService.exportPdf(id);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=report_${report.year}-${report.month}.pdf`,
    });

    res.send(buffer);
  }
}
