// lib/openrouter.ts
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet:beta";

export function normalizeContentToText(content: any): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item === null || typeof item !== "object") return "";
        return (item as any).text ?? (item as any).content ?? "";
      })
      .join("")
      .trim();
  }
  if (typeof content === "object")
    return (content as any).text ?? (content as any).content ?? "";
  return "";
}

export async function callOpenRouterChat({
  model = DEFAULT_MODEL,
  messages,
  temperature = 0.3,
}: {
  model?: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
}) {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY missing");
  }

  const res = await fetch(OPENROUTER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      Referer:
        process.env.NEXT_PUBLIC_SITE_URL ??
        "https://github.com/contractppts/contract-analyzer",
    },
    body: JSON.stringify({
      model,
      temperature,
      messages,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("OpenRouter chat error:", res.status, text.slice(0, 500));
    throw new Error("OpenRouter chat failed");
  }

  const json = await res.json();
  const first = json?.choices?.[0]?.message?.content;
  const content = normalizeContentToText(first);
  return content;
}
