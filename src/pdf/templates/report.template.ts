import { Report } from '@prisma/client';
import * as PDFDocument from 'pdfkit';
import * as path from 'path';

import { PdfTemplate } from '../dto';

const COLORS = {
  primary: '#2F5CE8',
  primaryDark: '#1E3FA8',
  text: '#1A1A1A',
  muted: '#6B7280',
  cardBg: '#F4F6FB',
  cardBorder: '#E2E6F0',
  positive: '#16A34A',
  negative: '#DC2626',
  divider: '#E5E7EB',
};

const FONTS = {
  regular: path.join(process.cwd(), 'fonts/Roboto-Regular.ttf'),
  bold: path.join(process.cwd(), 'fonts/Roboto-Bold.ttf'),
};

const MONTHS_RU = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

const PAGE_MARGIN = 50;

const formatNumber = (value: number): string =>
  new Intl.NumberFormat('tj-TJ').format(Math.round(value));

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('tj-TJ', {
    style: 'currency',
    currency: 'TJS',
    maximumFractionDigits: 0,
  }).format(value);

const formatPercent = (value: number): string =>
  `${(value * 100).toFixed(1).replace('.', ',')}%`;

export class ReportTemplate implements PdfTemplate<Report> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  render(doc: typeof PDFDocument.default, report: Report): void {
    doc.registerFont('Roboto', FONTS.regular);
    doc.registerFont('Roboto-Bold', FONTS.bold);
    doc.font('Roboto');

    this.drawHeader(doc, report);
    this.drawSummaryCards(doc, report);
    this.drawDetailsTable(doc, report);
    this.drawFooter(doc);
  }

  // Верхний цветной блок с названием и периодом
  private drawHeader(doc: typeof PDFDocument.default, report: Report): void {
    const pageWidth = doc.page.width;

    doc.rect(0, 0, pageWidth, 110).fill(COLORS.primary);

    doc
      .fillColor('#FFFFFF')
      .font('Roboto-Bold')
      .fontSize(22)
      .text('Отчёт по продажам', PAGE_MARGIN, 34, { align: 'left' });

    doc
      .font('Roboto')
      .fontSize(13)
      .fillColor('#DCE4FF')
      .text(`${MONTHS_RU[report.month - 1]} ${report.year}`, PAGE_MARGIN, 66, {
        align: 'left',
      });

    doc
      .font('Roboto')
      .fontSize(9)
      .fillColor('#DCE4FF')
      .text(
        `Сформирован: ${new Date().toLocaleDateString('ru-RU')}`,
        PAGE_MARGIN,
        86,
      );

    doc.fillColor(COLORS.text);
    doc.y = 140;
  }

  // Сетка карточек с ключевыми показателями
  private drawSummaryCards(
    doc: typeof PDFDocument.default,
    report: Report,
  ): void {
    const conversion =
      report.ordersCount > 0 ? report.paidOrdersCount / report.ordersCount : 0;

    const cards: { label: string; value: string; accent?: string }[] = [
      { label: 'Всего заказов', value: formatNumber(report.ordersCount) },
      {
        label: 'Оплаченных заказов',
        value: formatNumber(report.paidOrdersCount),
      },
      {
        label: 'Доход',
        value: formatCurrency(report.revenue / 100),
        accent: COLORS.positive,
      },
      {
        label: 'Средний чек',
        value: formatCurrency(report.avgOrderValue / 100),
      },
      {
        label: 'Сумма возвратов',
        value: formatCurrency(report.refundedAmount / 100),
        accent: report.refundedAmount > 0 ? COLORS.negative : undefined,
      },
      { label: 'Конверсия в оплату', value: formatPercent(conversion) },
    ];

    const startY = doc.y;
    const gap = 14;
    const columns = 2;
    const cardWidth =
      (doc.page.width - PAGE_MARGIN * 2 - gap * (columns - 1)) / columns;
    const cardHeight = 62;

    cards.forEach((card, i) => {
      const col = i % columns;
      const row = Math.floor(i / columns);
      const x = PAGE_MARGIN + col * (cardWidth + gap);
      const y = startY + row * (cardHeight + gap);

      doc
        .roundedRect(x, y, cardWidth, cardHeight, 6)
        .fillAndStroke(COLORS.cardBg, COLORS.cardBorder);

      doc
        .font('Roboto')
        .fontSize(10)
        .fillColor(COLORS.muted)
        .text(card.label, x + 16, y + 12, { width: cardWidth - 32 });

      doc
        .font('Roboto-Bold')
        .fontSize(16)
        .fillColor(card.accent ?? COLORS.text)
        .text(card.value, x + 16, y + 30, { width: cardWidth - 32 });
    });

    const rows = Math.ceil(cards.length / columns);
    doc.y = startY + rows * (cardHeight + gap) + 20;
  }

  // Табличное представление тех же данных для быстрой сверки
  private drawDetailsTable(
    doc: typeof PDFDocument.default,
    report: Report,
  ): void {
    const rows: [string, string][] = [
      ['Заказов всего', formatNumber(report.ordersCount)],
      ['Оплаченных заказов', formatNumber(report.paidOrdersCount)],
      ['Доход', formatCurrency(report.revenue)],
      ['Средний чек', formatCurrency(report.avgOrderValue)],
      ['Возвраты', formatCurrency(report.refundedAmount)],
    ];

    const tableX = PAGE_MARGIN;
    const tableWidth = doc.page.width - PAGE_MARGIN * 2;
    const rowHeight = 26;
    let y = doc.y + 4;

    doc
      .font('Roboto-Bold')
      .fontSize(13)
      .fillColor(COLORS.text)
      .text('Детализация', tableX, y);

    y += 24;

    rows.forEach(([label, value], i) => {
      if (i % 2 === 0) {
        doc.rect(tableX, y, tableWidth, rowHeight).fill('#FAFBFD');
      }

      doc
        .font('Roboto')
        .fontSize(11)
        .fillColor(COLORS.muted)
        .text(label, tableX + 12, y + 7);

      doc
        .font('Roboto-Bold')
        .fontSize(11)
        .fillColor(COLORS.text)
        .text(value, tableX, y + 7, { width: tableWidth - 12, align: 'right' });

      y += rowHeight;
    });

    doc
      .moveTo(tableX, y)
      .lineTo(tableX + tableWidth, y)
      .strokeColor(COLORS.divider)
      .stroke();

    doc.y = y + 16;
  }

  // Подвал с номером страницы
  private drawFooter(doc: typeof PDFDocument.default): void {
    const pageWidth = doc.page.width;
    const y = doc.page.height - 40;

    doc
      .moveTo(PAGE_MARGIN, y)
      .lineTo(pageWidth - PAGE_MARGIN, y)
      .strokeColor(COLORS.divider)
      .stroke();

    doc
      .font('Roboto')
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text('Автоматически сформированный отчёт', PAGE_MARGIN, y + 8);

    doc
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text('1', PAGE_MARGIN, y + 8, {
        align: 'right',
        width: pageWidth - PAGE_MARGIN * 2,
      });
  }
}
