import { Injectable } from '@nestjs/common';

import { SendRequest } from '@/email/dto/requests/send.request';

@Injectable()
export class EmailService {
  async send(dto: SendRequest) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'SmartTJ <onboarding@resend.dev>',
        to: dto.to,
        subject: dto.subject,
        html: dto.html,
      }),
    });
  }
}
