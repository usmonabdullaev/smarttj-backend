import * as PDFDocument from 'pdfkit';
import * as path from 'path';

import { PdfTemplate } from '../types/pdf-template.interface';

export class ReportTemplate implements PdfTemplate<any> {
  render(doc: typeof PDFDocument, report: any) {
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
