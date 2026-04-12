import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

@Injectable()
export class PdfService {
  generate<T>(
    template: { render(doc: typeof PDFDocument.default, data: any): void },
    data: T,
  ) {
    return new Promise((resolve) => {
      const doc = new PDFDocument.default({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      template.render(doc, data);

      doc.end();
    });
  }
}
