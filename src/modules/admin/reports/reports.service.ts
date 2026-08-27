import { Injectable, NotFoundException } from '@nestjs/common';

import { GetReportsDto } from '@/modules/admin/reports/dto/get-reports.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AdminReportsRepository } from './reports.repository';
import { ReportTemplate } from '@/pdf/templates';
import { PdfService } from '@/pdf/pdf.service';

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfService: PdfService,
    private readonly repository: AdminReportsRepository,
  ) {}

  async getList(dto: GetReportsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 12;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.repository.findMany(skip, limit),
      this.repository.count(),
    ]);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getById(id: string) {
    const report = await this.repository.getById(id);

    if (!report) {
      throw new NotFoundException();
    }

    return report;
  }

  async exportPdf(id: string) {
    const report = await this.getById(id);

    const buffer = await this.pdfService.generate({
      template: new ReportTemplate(),
      data: report,
    });

    return { report, buffer };
  }
}
