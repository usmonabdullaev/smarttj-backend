import { Module } from '@nestjs/common';

import { AdminReportsController } from '@/modules/admin/reports/reports.controller';
import { AdminReportsService } from '@/modules/admin/reports/reports.service';
import { AdminReportCron } from '@/modules/admin/reports/reports.cron';
import { PdfModule } from '@/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [AdminReportsController],
  providers: [AdminReportsService, AdminReportCron],
})
export class AdminReportsModule {}
