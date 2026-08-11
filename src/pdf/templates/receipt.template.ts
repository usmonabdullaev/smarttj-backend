import * as PDFDocument from 'pdfkit';
import * as path from 'path';
import {
  Address,
  Order,
  OrderDeliveryStatus,
  OrderItem,
  OrderPaymentStatus,
  OrderType,
  PaymentMethod,
  ProductVariant,
  User,
} from '@prisma/client';

import { PdfTemplate } from '../dto';

type OrderItems = (OrderItem & {
  productVariant: ProductVariant & {
    product: {
      title: string;
    };
  };
})[];

type OrderReceiptData = Order & {
  items: OrderItems;
  paymentMethod: PaymentMethod;
  address: Address | null;
  user: User;
};

const COLORS = {
  primary: '#2F5CE8',
  text: '#1A1A1A',
  muted: '#6B7280',
  cardBg: '#F4F6FB',
  cardBorder: '#E2E6F0',
  divider: '#E5E7EB',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  neutral: '#6B7280',
};

const FONTS = {
  regular: path.join(process.cwd(), 'fonts/Roboto-Regular.ttf'),
  bold: path.join(process.cwd(), 'fonts/Roboto-Bold.ttf'),
};

const PAGE_MARGIN = 50;

const PAYMENT_STATUS_LABEL: Record<OrderPaymentStatus, string> = {
  UNPAID: 'Не оплачен',
  PAID: 'Оплачен',
  FAILED: 'Ошибка оплаты',
  REFUNDED: 'Возврат средств',
};

const DELIVERY_STATUS_LABEL: Record<OrderDeliveryStatus, string> = {
  NEW: 'Только оформлен',
  PARTIALLY_DELIVERED: 'Часть товаров доставлена',
  DELIVERED: 'Все товары доставлены',
  RECEIVED: 'Товар у клиента',
  RETURNED: 'Товары возвращены',
};

const PAYMENT_STATUS_COLOR: Record<OrderPaymentStatus, string> = {
  UNPAID: COLORS.warning,
  PAID: COLORS.success,
  FAILED: COLORS.danger,
  REFUNDED: COLORS.neutral,
};

/**
 * PICKUP // Самовывоз
  DELIVERY // Доставка
 */

const TYPE_LABEL: Record<OrderType, string> = {
  PICKUP: 'Самовывоз',
  DELIVERY: 'Доставка',
};

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'TJS',
    maximumFractionDigits: 2,
  }).format(value);

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);

export class ReceiptTemplate implements PdfTemplate<OrderReceiptData> {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  render(doc: typeof PDFDocument.default, data: OrderReceiptData): void {
    doc.registerFont('Roboto', FONTS.regular);
    doc.registerFont('Roboto-Bold', FONTS.bold);
    doc.font('Roboto');

    this.drawHeader(doc, data);
    this.drawMeta(doc, data);
    this.drawItemsTable(doc, data.items);
    this.drawTotals(doc, data);
    if (data.comment) this.drawComment(doc, data.comment);
    this.drawFooter(doc);
  }

  private drawHeader(
    doc: typeof PDFDocument.default,
    data: OrderReceiptData,
  ): void {
    const pageWidth = doc.page.width;

    doc.rect(0, 0, pageWidth, 100).fill(COLORS.primary);

    doc
      .fillColor('#FFFFFF')
      .font('Roboto-Bold')
      .fontSize(20)
      .text('Квитанция заказа', PAGE_MARGIN, 30);

    doc
      .font('Roboto')
      .fontSize(11)
      .fillColor('#DCE4FF')
      .text(`№ ${data.id}`, PAGE_MARGIN, 58);

    doc
      .fontSize(9)
      .fillColor('#DCE4FF')
      .text(`от ${formatDate(data.createdAt)}`, PAGE_MARGIN, 74);

    const badgeLabel = PAYMENT_STATUS_LABEL[data.paymentStatus];
    doc.font('Roboto-Bold').fontSize(10);
    const badgeWidth = doc.widthOfString(badgeLabel) + 24;
    const badgeX = pageWidth - PAGE_MARGIN - badgeWidth;

    doc
      .roundedRect(badgeX, 30, badgeWidth, 22, 11)
      .fill(PAYMENT_STATUS_COLOR[data.paymentStatus]);

    doc
      .fillColor('#FFFFFF')
      .text(badgeLabel, badgeX, 36, { width: badgeWidth, align: 'center' });

    doc.fillColor(COLORS.text);
    doc.y = 128;
  }

  private drawMeta(
    doc: typeof PDFDocument.default,
    data: OrderReceiptData,
  ): void {
    const pairs: [string, string][] = [
      ['Статус доставки', DELIVERY_STATUS_LABEL[data.deliveryStatus]],
      ['Тип заказа', TYPE_LABEL[data.type]],
      ['Способ оплаты', data.paymentMethod.name],
      ['Получатель', `${data.user.name} (+992${data.user.phone})`],
    ];

    // if (data.shop.id) pairs.push(['Магазин', data.shop.title]);
    if (data.address?.id) pairs.push(['Адрес доставки', data.address.full]);

    const startY = doc.y;
    const cardX = PAGE_MARGIN;
    const cardWidth = doc.page.width - PAGE_MARGIN * 2;
    const lineHeight = 18;
    const cardHeight = pairs.length * lineHeight + 20;

    doc
      .roundedRect(cardX, startY, cardWidth, cardHeight, 6)
      .fillAndStroke(COLORS.cardBg, COLORS.cardBorder);

    let y = startY + 12;
    pairs.forEach(([label, value]) => {
      doc
        .font('Roboto')
        .fontSize(10)
        .fillColor(COLORS.muted)
        .text(label, cardX + 16, y, { width: 160 });

      doc
        .font('Roboto-Bold')
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(value, cardX + 180, y, {
          width: cardWidth - 196,
          align: 'right',
        });

      y += lineHeight;
    });

    doc.y = startY + cardHeight + 24;
  }

  private drawItemsTable(
    doc: typeof PDFDocument.default,
    items: OrderItems,
  ): void {
    const tableX = PAGE_MARGIN;
    const tableWidth = doc.page.width - PAGE_MARGIN * 2;

    const colTitle = tableX;
    const colTitleWidth = tableWidth * 0.46;
    const colQty = colTitle + colTitleWidth;
    const colQtyWidth = tableWidth * 0.12;
    const colPrice = colQty + colQtyWidth;
    const colPriceWidth = tableWidth * 0.2;
    const colSum = colPrice + colPriceWidth;
    const colSumWidth =
      tableWidth - colTitleWidth - colQtyWidth - colPriceWidth;

    doc
      .font('Roboto-Bold')
      .fontSize(13)
      .fillColor(COLORS.text)
      .text('Товары', tableX, doc.y);

    doc.y += 18;
    const headerY = doc.y;

    doc.font('Roboto-Bold').fontSize(9).fillColor(COLORS.muted);
    doc.text('Товар', colTitle, headerY, { width: colTitleWidth });
    doc.text('Кол-во', colQty, headerY, {
      width: colQtyWidth,
      align: 'center',
    });
    doc.text('Цена', colPrice, headerY, {
      width: colPriceWidth,
      align: 'right',
    });
    doc.text('Сумма', colSum, headerY, { width: colSumWidth, align: 'right' });

    let y = headerY + 16;
    doc
      .moveTo(tableX, y)
      .lineTo(tableX + tableWidth, y)
      .strokeColor(COLORS.divider)
      .stroke();
    y += 8;

    items.forEach((item, i) => {
      const title = item.productVariant?.product?.title ?? 'Товар недоступен';
      const variantLabel = item.productVariant?.label;
      const rowSum = item.price * item.quantity;

      const titleHeight = doc
        .font('Roboto')
        .fontSize(10)
        .heightOfString(title, { width: colTitleWidth });
      const rowHeight =
        Math.max(titleHeight + (variantLabel ? 12 : 0), 16) + 10;

      if (i % 2 === 0) {
        doc.rect(tableX, y - 4, tableWidth, rowHeight).fill('#FAFBFD');
      }

      doc
        .font('Roboto')
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(title, colTitle, y, { width: colTitleWidth });

      if (variantLabel) {
        doc
          .font('Roboto')
          .fontSize(8.5)
          .fillColor(COLORS.muted)
          .text(variantLabel, colTitle, y + titleHeight + 2, {
            width: colTitleWidth,
          });
      }

      doc
        .font('Roboto')
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(String(item.quantity), colQty, y, {
          width: colQtyWidth,
          align: 'center',
        });

      doc
        .font('Roboto')
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(formatCurrency(item.price / 100), colPrice, y, {
          width: colPriceWidth,
          align: 'right',
        });

      doc
        .font('Roboto-Bold')
        .fontSize(10)
        .fillColor(COLORS.text)
        .text(formatCurrency(rowSum / 100), colSum, y, {
          width: colSumWidth,
          align: 'right',
        });

      if (item.warranty) {
        doc
          .font('Roboto')
          .fontSize(8)
          .fillColor(COLORS.muted)
          .text(
            `Гарантия: ${item.warranty} мес.`,
            colQty,
            y + titleHeight + 2,
            {
              width: colTitleWidth,
            },
          );
      }

      y += rowHeight;
    });

    doc
      .moveTo(tableX, y)
      .lineTo(tableX + tableWidth, y)
      .strokeColor(COLORS.divider)
      .stroke();
    doc.y = y + 16;
  }

  private drawTotals(
    doc: typeof PDFDocument.default,
    data: OrderReceiptData,
  ): void {
    const tableWidth = doc.page.width - PAGE_MARGIN * 2;
    const boxWidth = 220;
    const boxX = PAGE_MARGIN + tableWidth - boxWidth;
    const y = doc.y;

    doc
      .font('Roboto')
      .fontSize(11)
      .fillColor(COLORS.muted)
      .text('Итого к оплате', boxX, y, { width: boxWidth - 100 });

    doc
      .font('Roboto-Bold')
      .fontSize(15)
      .fillColor(COLORS.primary)
      .text(formatCurrency(data.totalPrice / 100), boxX, y - 2, {
        width: boxWidth,
        align: 'right',
      });

    doc.y = y + 30;
  }

  private drawComment(doc: typeof PDFDocument.default, comment: string): void {
    const tableX = PAGE_MARGIN;
    const tableWidth = doc.page.width - PAGE_MARGIN * 2;

    doc
      .font('Roboto-Bold')
      .fontSize(10)
      .fillColor(COLORS.muted)
      .text('Комментарий к заказу', tableX, doc.y);

    doc.y += 4;

    doc
      .font('Roboto')
      .fontSize(10)
      .fillColor(COLORS.text)
      .text(comment, tableX, doc.y, { width: tableWidth });

    doc.y += 16;
  }

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
      .text('Спасибо за покупку!', PAGE_MARGIN, y + 8);

    doc
      .fontSize(8)
      .fillColor(COLORS.muted)
      .text('1', PAGE_MARGIN, y + 8, {
        align: 'right',
        width: pageWidth - PAGE_MARGIN * 2,
      });
  }
}
