import { Processor, WorkerHost } from '@nestjs/bullmq';
import { NotificationType, ProductStatus } from '@prisma/client';
import { Job } from 'bullmq';

import { NotificationService } from '@/bullmq/notification/notification.service';
import { PrismaService } from '@/database/prisma/prisma.service';
// import { userSelect } from '@/common/selects/user.select';
import { LoggerService } from '@/logger/logger.service';

@Processor('product-moderation')
export class ProductModerationProcessor extends WorkerHost {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
    private readonly notification: NotificationService,
  ) {
    super();
  }

  async process(job: Job) {
    switch (job.name) {
      case 'moderate-product': {
        const id = job.data.productId;
        const state = await job.getState();

        const product = await this.prisma.product.findUnique({
          where: { id },
          include: {
            variants: {
              include: {
                _count: {
                  select: { images: true },
                },
                attributes: true,
              },
            },
            partner: true,
          },
        });

        if (!product) {
          this.logger.warn(`[BullMQ] - Product ${id} not found`, {
            productId: id,
            jobId: job.id,
            state,
            attempt: job.attemptsMade + 1,
            attempts: job.opts.attempts,
          });

          throw new Error('Product not found');
        }

        if (!product.categoryId) {
          await this.notification.send({
            userId: product.partner.userId,
            type: NotificationType.PRODUCT_MODERATION,
            title: 'Товар не прошел проверку',
            message: `Ваш товар «${product.title}» требует доработки. Укажите категорию товара перед повторной отправкой на модерацию.`,
            metadata: {
              productId: product.id,
            },
          });

          return;
        }

        if (!product.brandId) {
          await this.notification.send({
            userId: product.partner.userId,
            type: NotificationType.PRODUCT_MODERATION,
            title: 'Товар не прошел проверку',
            message: `Ваш товар «${product.title}» требует доработки. Укажите бренд товара перед повторной отправкой на модерацию.`,
            metadata: {
              productId: product.id,
            },
          });

          return;
        }

        if (!product.regionId) {
          await this.notification.send({
            userId: product.partner.userId,
            type: NotificationType.PRODUCT_MODERATION,
            title: 'Товар не прошел проверку',
            message: `Ваш товар «${product.title}» требует доработки. Укажите регион размещения товара перед повторной отправкой на модерацию.`,
            metadata: {
              productId: product.id,
            },
          });

          return;
        }

        const requiredAttributes = await this.prisma.attribute.findMany({
          where: { categoryId: product.categoryId, required: true },
          select: { id: true },
        });

        for (let i = 0; i < product.variants.length; i++) {
          const variant = product.variants[i];

          if (variant._count.images === 0) {
            await this.notification.send({
              userId: product.partner.userId,
              type: NotificationType.PRODUCT_MODERATION,
              title: 'Товар не прошел проверку',
              message: `Ваш товар «${product.title}» требует доработки. Добавьте хотя бы одно изображение товара перед повторной отправкой на модерацию.`,
              metadata: {
                productId: product.id,
              },
            });

            return;
          }

          const providedIds = new Set(
            variant.attributes.map((attr) => attr.attributeId),
          );

          const missing = requiredAttributes.filter(
            (attr) => !providedIds.has(attr.id),
          );

          if (missing.length > 0) {
            await this.notification.send({
              userId: product.partner.userId,
              type: NotificationType.PRODUCT_MODERATION,
              title: 'Товар не прошел проверку',
              message: `Ваш товар «${product.title}» требует доработки. Заполните все обязательные характеристики товара перед повторной отправкой на модерацию.`,
              metadata: {
                productId: product.id,
              },
            });

            return;
          }
        }

        await this.prisma.product.update({
          where: { id },
          data: {
            status: ProductStatus.ACTIVE,
            publishedAt: new Date(),
          },
        });
      }
    }
  }
}
