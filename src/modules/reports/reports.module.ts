import { Module } from '@nestjs/common';

import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { ReportCron } from './report.cron';
import { PdfModule } from '../../pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportCron],
})
export class ReportsModule {}
