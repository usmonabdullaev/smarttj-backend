import { NotificationType } from '@prisma/client';

export class SendNotificationDto {
  userId!: string;
  type!: NotificationType;
  title!: string;
  message!: string;
  metadata?: {
    [key: string]: any;
  };
}
