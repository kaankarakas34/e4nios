import { AiJsonRequest, AiJsonResponse, AiProvider } from "@/lib/ai/provider";

export class OpenRouterProvider implements AiProvider {
  private readonly apiKey = process.env.OPENROUTER_API_KEY;
  private readonly defaultModel =
    process.env.OPENROUTER_DEFAULT_MODEL ?? "openai/gpt-4.1-mini";

  async generateJson<T>({
    system,
    user,
    model = this.defaultModel,
    temperature = 0.2,
  }: AiJsonRequest): Promise<AiJsonResponse<T>> {
    if (!this.apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured.");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter request failed: ${response.status}`);
    }

    const raw = await response.json();
    const content = raw.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("OpenRouter returned an empty response.");
    }

    return {
      data: JSON.parse(content) as T,
      model,
      provider: "openrouter",
      raw,
    };
  }
}
