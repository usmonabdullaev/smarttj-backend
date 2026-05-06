export interface GoogleTokensDto {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  token_type: 'Bearer';
  id_token: string;
}

export interface GoogleProfileDto {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string | null;
}
