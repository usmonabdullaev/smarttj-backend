import { BadRequestException, Injectable } from '@nestjs/common';

import { GetProfileResponse } from '@/auth/google/dto/responses/get-profile.response';
import { GetTokensResponse } from '@/auth/google/dto/responses/get-tokens.response';

@Injectable()
export class GoogleOAuthService {
  private GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
  private GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
  private GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

  getAuthUrl(fingerprint: string) {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL as string,
      response_type: 'code',
      scope: 'email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: fingerprint,
    });

    return `${this.GOOGLE_AUTH_URL}?${params.toString()}`;
  }

  async getTokens(code: string): Promise<GetTokensResponse> {
    const res = await fetch(this.GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_CALLBACK_URL,
        grant_type: 'authorization_code',
      }),
    });

    if (!res.ok) {
      throw new BadRequestException('Failed to exchange code for tokens');
    }

    return await res.json();
  }

  async getProfile(accessToken: string): Promise<GetProfileResponse> {
    const res = await fetch(this.GOOGLE_USERINFO_URL, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      throw new BadRequestException('Failed to get Google profile');
    }

    return await res.json();
  }
}
