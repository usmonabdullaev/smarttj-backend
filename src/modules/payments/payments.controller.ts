import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

import { GetUser } from '@/common/decorators/get-user.decorator';
import { JwtAuthGuard } from '@/auth/guards/jwt.guard';
import { PaymentsService } from './payments.service';
import { OrderRequest } from './dto';

@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('test')
  @ApiOperation({ summary: 'Test payment' })
  async test(@Body() dto: OrderRequest, @GetUser('userId') userId: string) {
    return await this.paymentsService.test(dto, userId);
  }
}
