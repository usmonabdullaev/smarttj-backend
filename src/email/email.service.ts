import { Injectable } from '@nestjs/common';

import { SendEmailOptions } from '@/email/dto/email.dto';

@Injectable()
export class EmailService {
  async send({ to, subject, html }: SendEmailOptions) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Smart Shop <onboarding@resend.dev>',
        to,
        subject,
        html,
      }),
    });
  }
}
