export interface RetrievalResult {
  content: string;
  metadata: Record<string, unknown>;
  score: number;
}
