import { Module } from '@nestjs/common';

import { OrdersController } from '@/modules/orders/orders.controller';
import { OrdersService } from '@/modules/orders/orders.service';
import { PdfModule } from '@/pdf/pdf.module';

@Module({
  imports: [PdfModule],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
