import { Module } from '@nestjs/common';

import { PdfModule } from '@/pdf/pdf.module';
import { AdminOrdersController } from './orders.controller';
import { AdminOrdersService } from './orders.service';

@Module({
  imports: [PdfModule],
  controllers: [AdminOrdersController],
  providers: [AdminOrdersService],
  exports: [AdminOrdersService],
})
export class AdminOrdersModule {}
