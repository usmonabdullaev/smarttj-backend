export enum AIPurpose {
  SUPPORT = 'SUPPORT',
  ANALYTICS = 'ANALYTICS',
  PRODUCT_MODERATE = 'PRODUCT_MODERATE',
}

export class AIRequestDto {
  purpose!: AIPurpose;
  prompt!: string;
  context?: string;
  model?: string;
  temperature?: number;
}
