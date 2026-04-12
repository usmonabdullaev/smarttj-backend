import { Module } from '@nestjs/common';

import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { PdfModule } from '../../pdf/pdf.module';
import { ReportCron } from './report.cron';

@Module({
  imports: [PdfModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportCron],
})
export class ReportsModule {}
