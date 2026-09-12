import { Injectable } from '@nestjs/common';

import { SendRequest } from '@/email/dto/requests/send.request';

import { LoggerService } from '@/logger/logger.service';

@Injectable()
export class EmailService {
  private readonly logger = new LoggerService(EmailService.name);

  async send(dto: SendRequest) {
    const from =
      process.env.RESEND_FROM_EMAIL || 'SmartTJ <onboarding@resend.dev>';
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      this.logger.warn('RESEND_API_KEY is not set. Email not sent.', {
        to: dto.to,
        subject: dto.subject,
      });
      return;
    }

    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: dto.to,
          subject: dto.subject,
          html: dto.html,
        }),
      });

      if (!res.ok) {
        const errBody = await res.text();
        this.logger.error('Failed to send email via Resend', {
          status: res.status,
          error: errBody,
          to: dto.to,
        });
      }
    } catch (error) {
      this.logger.error('Error sending email', error);
    }
  }
}
