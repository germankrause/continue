import { EmbedOptions } from "../..";
import BaseEmbeddingsProvider from "./BaseEmbeddingsProvider";
import { fetchWithExponentialBackoff } from "./util";

class OpenAIEmbeddingsProvider extends BaseEmbeddingsProvider {
  static defaultOptions: Partial<EmbedOptions> | undefined = {
    apiBase: "https://api.openai.com/v1/",
    model: "text-embedding-3-small",
  };

  get id(): string {
    return this.options.model ?? "openai";
  }

  async embed(chunks: string[]) {
    return await Promise.all(
      chunks.map(async (chunk) => {
        const resp = await fetchWithExponentialBackoff(
          new URL("embeddings", this.options.apiBase).toString(),
          {
            method: "POST",
            body: JSON.stringify({
              input: chunk,
              model: this.options.model,
            }),
            headers: {
              Authorization: `Bearer ${this.options.apiKey}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await resp.json();
        return data.data[0].embedding;
      }),
    );
  }
}

export default OpenAIEmbeddingsProvider;
