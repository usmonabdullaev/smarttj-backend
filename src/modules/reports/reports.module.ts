import { Module } from '@nestjs/common';

import { ReportsController } from '@/modules/reports/reports.controller';
import { ReportsService } from '@/modules/reports/reports.service';
import { ReportCron } from '@/modules/reports/report.cron';
import { PdfModule } from '@/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [ReportsController],
  providers: [ReportsService, ReportCron],
})
export class ReportsModule {}
