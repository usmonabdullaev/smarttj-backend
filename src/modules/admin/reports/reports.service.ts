import { Injectable, NotFoundException } from '@nestjs/common';

import { GetReportsDto } from '@/modules/admin/reports/dto/get-reports.dto';
import { AdminReportsRepository } from './reports.repository';
import { BaseRepository } from '@/common/repositories';
import { ReportTemplate } from '@/pdf/templates';
import { PdfService } from '@/pdf/pdf.service';

@Injectable()
export class AdminReportsService {
  constructor(
    private readonly pdfService: PdfService,
    private readonly repository: AdminReportsRepository,
    private readonly baseRepository: BaseRepository,
  ) {}

  async getList(dto: GetReportsDto) {
    const page = dto.page || 1;
    const limit = dto.limit || 12;
    const skip = (page - 1) * limit;

    const [items, total] = await this.baseRepository.transaction([
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
