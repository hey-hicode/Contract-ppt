// lib/openrouter.ts
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

export const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet:beta";

type MaybeText = { text?: string; content?: string };
function isMaybeText(obj: unknown): obj is MaybeText {
  return !!obj && typeof obj === "object" && ("text" in (obj as MaybeText) || "content" in (obj as MaybeText));
}

export function normalizeContentToText(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item === null || typeof item !== "object") return "";
        return isMaybeText(item) ? item.text ?? item.content ?? "" : "";
      })
      .join("")
      .trim();
  }
  if (typeof content === "object" && isMaybeText(content)) {
    return content.text ?? content.content ?? "";
  }
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
