export type AiJsonRequest = {
  system: string;
  user: string;
  model?: string;
  temperature?: number;
};

export type AiJsonResponse<T> = {
  data: T;
  model: string;
  provider: "openrouter";
  raw: unknown;
};

export interface AiProvider {
  generateJson<T>(request: AiJsonRequest): Promise<AiJsonResponse<T>>;
}
