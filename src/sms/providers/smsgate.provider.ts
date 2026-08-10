import { SmsgateResponse } from '@/sms/dto/responses/smsgate.response';
import { SmsgateRequest } from '@/sms/dto/requests/smsgate.request';

export class SmsgateProvider {
  private SMSGATE_API_KEY = process.env.SMSGATE_API_KEY as string;
  private SMSGATE_SENDER_ADDRESS = process.env.SMSGATE_SENDER_ADDRESS as string;
  private SMSGATE_API_URL = process.env.SMSGATE_API_URL as string;

  async send({
    phone,
    message,
    priority = 2,
    smsType = 2,
    scheduledAt,
    expiresIn = 0,
    label,
  }: SmsgateRequest): Promise<SmsgateResponse> {
    // eslint-disable-next-line no-useless-catch
    try {
      const res = await fetch(this.SMSGATE_API_URL, {
        method: 'POST',
        headers: {
          'X-Api-Key': this.SMSGATE_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          PhoneNumber: `992${phone}`,
          Text: message,
          SenderAddress: this.SMSGATE_SENDER_ADDRESS,
          Priority: priority,
          SmsType: smsType,
          ScheduledAt: scheduledAt,
          ExpiresIn: expiresIn,
          SmsLabel: label,
        }),
      });

      if (!res.ok) {
        throw await res.json();
      }

      return await res.json();
    } catch (error) {
      throw error;
    }
  }
}
