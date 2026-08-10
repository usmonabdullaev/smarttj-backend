export interface AskResponse {
  text: string;
  confidence?: number;
  ok?: boolean;
  tokens?: number;
  raw?: any;
}
