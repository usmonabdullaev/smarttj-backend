export enum AIPurpose {
  SUPPORT = 'support',
  ANALYTICS = 'analytics',
}

export class AIRequestDto {
  purpose: AIPurpose;
  prompt: string;
  context?: string;
  model?: string;
  temperature?: number;
}
