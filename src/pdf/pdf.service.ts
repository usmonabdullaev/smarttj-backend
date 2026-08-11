import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';

import { GenerateRequest } from './dto';

@Injectable()
export class PdfService {
  generate<T>(dto: GenerateRequest<T>) {
    return new Promise((resolve) => {
      const doc = new PDFDocument.default({ margin: 40 });
      const chunks: Buffer[] = [];

      doc.on('data', (c) => chunks.push(c));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      dto.template.render(doc, dto.data);

      doc.end();
    });
  }
}
