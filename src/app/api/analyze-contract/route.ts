import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

const OPENROUTER_API_URL =
  "https://openrouter.ai/api/v1/chat/completions";

type AnalyzeRequestBody = {
  text?: string;
  documentName?: string;
  instructions?: string;
  model?: string;
};

type OpenRouterChoice = {
  message?: {
    role?: string;
    content?: string | Array<{ type: string; text?: string }>;
  };
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

type ContractAnalysis = {
  summary: string;
  keyClauses: string[];
  risks: string[];
  actionItems: string[];
  suggestedPrompts?: string[];
};

const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet:beta";

const SYSTEM_PROMPT = `
You are senior entertainment and commercial counsel supporting creators, artists, and influencer teams.
Return concise, actionable guidance that highlights rights, compensation, deliverables, and risks for music, brand, and sponsorship agreements.

Required JSON structure:
{
  "summary": "3-4 sentence overview of the agreement purpose and status.",
  "keyClauses": ["Clause insight 1", "Clause insight 2", "..."],
  "risks": ["Risk item 1", "..."],
  "actionItems": ["Action for counsel or business stakeholders", "..."],
  "suggestedPrompts": [
    "Optional follow-up prompt template for OpenRouter models",
    "Another helpful prompt"
  ]
}

Keep the tone professional and tactically focused.
`;

const defaultPrompts = [
  "Suggest negotiation angles for exclusivity or non-compete language.",
  "Summarize royalty or payout terms to review with management.",
  "Highlight deliverables and brand obligations that need tracking.",
];

const parseContent = (choice?: OpenRouterChoice): ContractAnalysis | null => {
  if (!choice?.message?.content) {
    return null;
  }

  const content = choice.message.content;
  const text =
    typeof content === "string"
      ? content
      : content
          .map((item) => ("text" in item && item.text ? item.text : ""))
          .join("")
          .trim();

  if (!text) {
    return null;
  }

  try {
    const parsed = JSON.parse(text) as Partial<ContractAnalysis>;
    return {
      summary: parsed.summary ?? "",
      keyClauses: parsed.keyClauses ?? [],
      risks: parsed.risks ?? [],
      actionItems: parsed.actionItems ?? [],
      suggestedPrompts: parsed.suggestedPrompts ?? defaultPrompts,
    };
  } catch {
    return {
      summary: text,
      keyClauses: [],
      risks: [],
      actionItems: [],
      suggestedPrompts: defaultPrompts,
    };
  }
};

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return NextResponse.json(
      {
        error:
          "OpenRouter API key missing. Configure OPENROUTER_API_KEY in your environment.",
      },
      { status: 500 }
    );
  }

  let body: AnalyzeRequestBody;
  try {
    body = (await req.json()) as AnalyzeRequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const { text, documentName, instructions, model } = body;

  if (!text || text.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing contract text to analyze." },
      { status: 400 }
    );
  }

  const userPrompt = `
Document: ${documentName ?? "Unnamed contract"}

${instructions ?? ""}

Contract content:
${text}
`.trim();

  try {
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer":
          process.env.NEXT_PUBLIC_SITE_URL ??
          "https://github.com/contractppts/contract-analyzer",
      },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("OpenRouter error:", errorBody);
      return NextResponse.json(
        { error: "OpenRouter analysis failed." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as OpenRouterResponse;
    const analysis = parseContent(data.choices?.[0]);

    if (!analysis) {
      return NextResponse.json(
        { error: "Unable to parse analysis response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      analysis,
      model: model ?? DEFAULT_MODEL,
    });
  } catch (error) {
    console.error("OpenRouter request failed:", error);
    return NextResponse.json(
      { error: "Unexpected error calling OpenRouter." },
      { status: 500 }
    );
  }
}
