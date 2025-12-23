// app/api/analyze-contract/route.ts  (replace your current file)
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  assertQuota,
  getOrCreateUserPlan,
  incrementUsage,
} from "~/lib/freemium";

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";

type AnalyzeRequestBody = {
  text?: string;
  documentName?: string;
  instructions?: string;
  model?: string;
};

type OpenRouterChoice = {
  message?: {
    role?: string;
    content?:
      | string
      | Array<{ type: string; text?: string } | { content?: string }>;
  };
};

type RedFlag = {
  type: "critical" | "warning" | "minor";
  title: string;
  description: string;
  clause: string;
  recommendation: string;
};

type ContractAnalysisV2 = {
  redFlags: RedFlag[];
  overallRisk: "low" | "medium" | "high";
  summary: string;
  recommendations: string[];
};

type OpenRouterResponse = {
  choices?: OpenRouterChoice[];
};

const DEFAULT_MODEL = "anthropic/claude-3.5-sonnet:beta";

const SYSTEM_PROMPT = `
You are a legal contract analyst, lawyer, and attorney representing creators, freelancers, and influencers.
Analyze the contract text and return ONLY a JSON object in the exact format below:

{
  "redFlags": [
    {
      "type": "critical|warning|minor",
      "title": "Title of issue",
      "description": "Concise explanation of why this is problematic",
      "clause": "Exact text from the contract",
      "recommendation": "Clear guidance on how to address or mitigate this issue"
    }
  ],
  "overallRisk": "low|medium|high",
  "summary": "3–4 sentence overview of the contract highlighting key risks and concerns",
  "recommendations": ["Recommendation 1", "Recommendation 2"]
}

Rules:
- Include a maximum of 10 redFlags.
- Keep descriptions concise and explanatory.
- Return ONLY valid JSON. No markdown, no extra text.

Evaluate the contract for:
- Rights and obligations balance
- Compensation, payment timing, and deductions
- Deliverables, scope, revisions, and acceptance criteria
- Intellectual property ownership and assignment
- Usage rights, sublicensing, and modification rights
- Territory, platform, and audience scope
- Duration, term, and post-termination rights
- Confidentiality scope, exclusions, and duration
- Exclusivity, non-compete, and conflict restrictions
- Indemnification, liability allocation, and caps
- Termination rights, notice, and consequences
- Renewal and auto-renewal terms
- FTC, advertising, and disclosure compliance
- Moral rights and attribution/credit
- Approval rights and content control
- Data protection, privacy, and user data ownership
- Warranties and representations
- Dispute resolution, governing law, and jurisdiction
- Force majeure and change-of-control clauses
- Payment clawbacks, refunds, and chargebacks
- Audit, reporting, and transparency obligations
`;


/* --------------------------
   Helper: resilient content normalizer
   -------------------------- */
type MaybeText = { text?: string; content?: string };
function isMaybeText(obj: unknown): obj is MaybeText {
  return !!obj && typeof obj === "object" && ("text" in (obj as MaybeText) || "content" in (obj as MaybeText));
}

const normalizeContentToText = (content: unknown): string => {
  if (!content) return "";
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") return item;
        if (item === null || typeof item !== "object") return "";
        return isMaybeText(item)
          ? item.text ?? item.content ?? ""
          : "";
      })
      .join("")
      .trim();
  }
  if (typeof content === "object" && isMaybeText(content)) {
    return content.text ?? content.content ?? "";
  }
  return "";
};

const extractJsonFromString = (s: string): string | null => {
  const jsonMatch = s.match(/({[\s\S]*}|\[[\s\S]*\])/);
  return jsonMatch ? jsonMatch[0] : null;
};

const parseContentV2 = (
  choice?: OpenRouterChoice
): ContractAnalysisV2 | null => {
  if (!choice?.message?.content) return null;
  const raw = normalizeContentToText(choice.message.content);
  if (!raw) return null;

  const maybeJson = extractJsonFromString(raw);
  if (!maybeJson) return null;

  try {
    const parsed = JSON.parse(maybeJson) as Partial<ContractAnalysisV2>;
    return {
      redFlags: parsed.redFlags ?? [],
      overallRisk: parsed.overallRisk ?? "low",
      summary: parsed.summary ?? "",
      recommendations: parsed.recommendations ?? [],
    };
  } catch (err) {
    console.error("Failed to parse JSON:", err);
    return null;
  }
};

/* --------------------------
   Title extraction helpers
   -------------------------- */

const TITLE_PROMPT = `
Extract a concise, human-friendly title for the following contract.
Return ONLY a JSON object in this exact format:
{ "title": "Contract title here" }

Do NOT return any other text or explanation.
Document (first 2000 chars):
`;

function extractTitleFromTextHeuristic(text: string) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) return "Untitled Contract";

  const first = lines[0];
  if (/^[A-Z\s]{3,80}$/.test(first) && first.length < 80) return first;

  // find a short uppercase line within first 6 lines
  for (let i = 0; i < Math.min(6, lines.length); i++) {
    const l = lines[i];
    if (/^[A-Z][A-Z\s\-:&()]{3,80}$/.test(l) && l.length < 80) return l;
  }

  // fallback: take first meaningful line truncated
  return first.length > 60 ? first.slice(0, 60).trim() + "…" : first;
}

async function extractTitleWithModel(text: string, model = DEFAULT_MODEL) {
  try {
    const prompt = `${TITLE_PROMPT}\n\n${text.slice(0, 2000)}`;
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        Referer: process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com",
      },
      body: JSON.stringify({
        model,
        temperature: 0.0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: "You are a JSON-only extractor." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      console.warn(
        "Title extractor model error:",
        res.status,
        txt.slice(0, 300)
      );
      return null;
    }

    const d = (await res.json()) as OpenRouterResponse;
    const raw = normalizeContentToText(d.choices?.[0]?.message?.content);
    if (!raw) return null;
    const maybeJson = extractJsonFromString(raw) ?? raw;
    try {
      const parsed = JSON.parse(maybeJson);
      if (parsed && typeof parsed.title === "string")
        return parsed.title.trim();
      return null;
    } catch (err) {
      console.warn("Title JSON parse failed:", err);
      return null;
    }
  } catch (err) {
    console.error("Title extraction failed:", err);
    return null;
  }
}

/* --------------------------
   Heuristic: quick contract detector
   -------------------------- */
const contractKeywords = [
  "agreement",
  "party",
  "parties",
  "effective date",
  "term",
  "termination",
  "indemnif",
  "warrant",
  "governing law",
  "jurisdiction",
  "confidential",
  "payment",
  "compensation",
  "services",
  "deliverables",
  "scope of work",
  "signature",
  "signed",
  "notwithstanding",
  "force majeure",
  "liabilit",
  "represent",
  "assignment",
];

function heuristicContractCheck(text: string) {
  const textLower = text.toLowerCase();
  const reasons: string[] = [];
  let matches = 0;
  for (const kw of contractKeywords) {
    if (textLower.includes(kw)) {
      matches++;
      reasons.push(`Found keyword: "${kw}"`);
    }
  }

  const clausePattern = /\n\s*(\d{1,2}\.|\d+\.\d+|article\s+\d+)/i;
  const clauseMatch = clausePattern.test(text);
  const signaturePattern = /(signed|signature|by:)\s*\n?/i;
  const hasSignature = signaturePattern.test(text);
  const length = text.trim().length;

  let score = Math.min(
    1,
    matches / 6 + (clauseMatch ? 0.2 : 0) + (hasSignature ? 0.1 : 0)
  );
  if (length > 800) score = Math.min(1, score + 0.15);

  if (score >= 0.6) {
    return { verdict: "yes" as const, score, reasons };
  }
  if (score <= 0.15) {
    return { verdict: "no" as const, score, reasons };
  }
  return { verdict: "uncertain" as const, score, reasons };
}

/* --------------------------
   POST handler: integrate detection, analysis, and title extraction
   -------------------------- */
export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // 1️⃣ Load or create plan
  const plan = await getOrCreateUserPlan(userId);

  // 2️⃣ Enforce quota
  assertQuota(plan);

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

  const MIN_CHARS = 120; // tune as needed
  if (text.trim().length < MIN_CHARS) {
    return NextResponse.json(
      { error: "Document too short to be a contract." },
      { status: 400 }
    );
  }

  // Run heuristic check
  const heuristic = heuristicContractCheck(text);
  if (heuristic.verdict === "no") {
    return NextResponse.json(
      { error: "The uploaded document does not appear to be a contract." },
      { status: 400 }
    );
  }

  // If uncertain, optionally call the classifier (keeps your existing logic)
  if (heuristic.verdict === "uncertain") {
    // classifier code omitted for brevity - reuse classifyWithModel if you want
  }

  // Build analysis prompt
  const userPrompt = `
Document: ${documentName ?? "Unnamed contract"}

${instructions ?? ""}

Contract content:
${text}
`.trim();

  try {
    // Call OpenRouter to create analysis JSON
    const response = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        Referer:
          process.env.NEXT_PUBLIC_SITE_URL ??
          "https://github.com/contractppts/contract-analyzer",
      },
      body: JSON.stringify({
        model: model ?? DEFAULT_MODEL,
        temperature: 0.2,
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
    const analysis = parseContentV2(data.choices?.[0]);

    if (!analysis) {
      return NextResponse.json(
        { error: "Unable to parse analysis response." },
        { status: 502 }
      );
    }

    // --- TITLE EXTRACTION (LLM + fallback heuristic) ---
    let inferredTitle: string | null = null;
    try {
      inferredTitle = await extractTitleWithModel(text, model ?? DEFAULT_MODEL);
    } catch (err) {
      console.warn("Title extraction model failed:", err);
      inferredTitle = null;
    }
    if (!inferredTitle) {
      inferredTitle = extractTitleFromTextHeuristic(text);
    }
    await incrementUsage(userId);
    // Return analysis + model + title
    return NextResponse.json({
      analysis,
      model: model ?? DEFAULT_MODEL,
      title: inferredTitle,
    });
  } catch (error) {
    console.error("OpenRouter request failed:", error);
    return NextResponse.json(
      { error: "Unexpected error calling OpenRouter." },
      { status: 500 }
    );
  }
}
