import * as PDFDocument from 'pdfkit';

export interface GenerateRequest<T> {
  template: { render(doc: typeof PDFDocument.default, data: any): void };
  data: T;
}
