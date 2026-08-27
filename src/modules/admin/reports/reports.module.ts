import { Module } from '@nestjs/common';

import { AdminReportsController } from '@/modules/admin/reports/reports.controller';
import { AdminReportsService } from '@/modules/admin/reports/reports.service';
import { AdminReportCron } from '@/modules/admin/reports/reports.cron';
import { AdminReportsRepository } from './reports.repository';
import { PdfModule } from '@/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [AdminReportsController],
  providers: [AdminReportsService, AdminReportCron, AdminReportsRepository],
})
export class AdminReportsModule {}
