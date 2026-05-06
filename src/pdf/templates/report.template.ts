import * as PDFDocument from 'pdfkit';
import * as path from 'path';

import { PdfTemplate } from '@/pdf/types/pdf-template.interface';

export class ReportTemplate implements PdfTemplate<any> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  render(doc: typeof PDFDocument.default, report: any) {
    doc.font(path.join(process.cwd(), 'fonts/Roboto-Regular.ttf'));

    doc
      .fontSize(18)
      .text(`Отчёт за ${report.month}.${report.year}`, { align: 'center' });

    doc.moveDown();

    doc.fontSize(12);
    doc.text(`Заказы: ${report.ordersCount}`);
    doc.text(`Доход: ${report.revenue}`);
    doc.text(`Средний чек: ${report.avgOrderValue}`);
  }
}
