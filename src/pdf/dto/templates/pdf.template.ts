import * as PDFDocument from 'pdfkit';

export interface PdfTemplate<T = any> {
  render(doc: typeof PDFDocument, data: T): Promise<void> | void;
}
