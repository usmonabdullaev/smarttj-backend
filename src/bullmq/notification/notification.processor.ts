import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

import { SendNotificationDto } from '@/bullmq/notification/dto/notification.dto';
import { PrismaService } from '@/database/prisma/prisma.service';
import { userSelect } from '@/common/selects/user.select';
import { LoggerService } from '@/logger/logger.service';

@Processor('notification')
export class NotificationProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'notification': {
        const dto = job.data as SendNotificationDto;
        const state = await job.getState();
        // const isLastAttempt = job.attemptsMade + 1 === job.opts.attempts;

        const user = await this.prisma.user.findUnique({
          where: { id: dto.userId },
          select: userSelect,
        });

        if (!user) {
          this.logger.warn(`[BullMQ] - User ${dto.userId} not found`, {
            userId: dto.userId,
            jobId: job.id,
            state,
            attempt: job.attemptsMade + 1,
            attempts: job.opts.attempts,
          });

          throw new Error('User not found');
        }

        await this.prisma.notification.create({
          data: {
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            message: dto.message,
            metadata: dto.metadata,
          },
        });
      }
    }
  }
}
