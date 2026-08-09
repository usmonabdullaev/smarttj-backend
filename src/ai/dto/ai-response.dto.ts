export class AIResponseDto {
  text!: string;
  confidence?: number;
  ok?: boolean;
  tokens?: number;
  raw?: any;
}
