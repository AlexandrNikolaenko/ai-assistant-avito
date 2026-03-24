export type OllamaGenerateOut = { response: string };

const ollamaBaseUrl =
  import.meta.env.VITE_OLLAMA_BASE_URL ?? "http://localhost:11434";
const ollamaModel = import.meta.env.VITE_OLLAMA_MODEL ?? "llama3";

export async function ollamaGenerate(
  prompt: string,
  signal?: AbortSignal,
): Promise<string> {
  const res = await fetch(`${ollamaBaseUrl}/api/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: ollamaModel,
      prompt,
      stream: false,
    }),
    signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Ollama error: ${res.status} ${res.statusText}${text ? `: ${text}` : ""}`,
    );
  }

  const data = (await res.json()) as OllamaGenerateOut & { response?: string };
  const response = data.response;
  if (typeof response !== "string")
    throw new Error("Ollama returned empty response");

  return response.trim();
}
