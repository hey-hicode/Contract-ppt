import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { supabase } from "~/lib/supabaseClient";
import { callOpenRouterChat, DEFAULT_MODEL } from "~/lib/openrouter";

interface RedFlag {
  type: "critical" | "warning" | "minor";
  title: string;
  description: string;
  clause: string;
  recommendation: string;
}

type Body = {
  message: string;
  threadId?: string | null;
  model?: string;
  extraInstructions?: string;
};

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ analysisId: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // 🔒 PREMIUM CHECK (Document Chat)
  const { data: plan, error: planErr } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  if (planErr || !plan) {
    return NextResponse.json({ error: "User plan not found" }, { status: 403 });
  }

  if (plan.plan !== "premium") {
    return NextResponse.json(
      { error: "Upgrade to premium to chat with contracts." },
      { status: 403 }
    );
  }

  const { analysisId } = await params;
  const body: Body = await req.json();
  const { message, threadId, model, extraInstructions } = body;

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  /**
   * 1. Load analysis (lightweight fields only)
   */
  const { data: analysis } = await supabase
    .from("analyses")
    .select(
      "id,user_id,source_title,overall_risk,summary,red_flags,recommendations"
    )
    .eq("id", analysisId)
    .single();

  if (!analysis || analysis.user_id !== userId) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  /**
   * 2. Ensure thread
   */
  let currentThreadId = threadId ?? null;

  if (!currentThreadId) {
    const { data } = await supabase
      .from("chat_threads")
      .insert({
        user_id: userId,
        analysis_id: analysisId,
        title: (analysis.source_title as string) ?? "Contract Chat",
        is_saved: false,
      })
      .select("id")
      .single();

    currentThreadId = data?.id;
  }

  /**
   * 3. Fetch ONLY last 8 messages
   */
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", currentThreadId)
    .order("created_at", { ascending: false })
    .limit(8);

  /**
   * 4. Compact system prompt (CRITICAL)
   */
  const systemPrompt = `
You are an AI assistant helping explain ONE specific contract.
Use the analysis below. Be clear and practical.
No legal advice.

Contract: ${analysis.source_title ?? "Untitled"}
Risk: ${analysis.overall_risk ?? "Unknown"}

Summary:
${analysis.summary ?? "N/A"}

Red Flags:
${Array.isArray(analysis.red_flags)
      ? (analysis.red_flags as unknown as RedFlag[]).map((r) => `- ${r.title}: ${r.description}`).join("\n")
      : "None"
    }

Recommendations:
${Array.isArray(analysis.recommendations)
      ? (analysis.recommendations as string[]).join("\n- ")
      : "None"
    }

${extraInstructions ?? ""}
`.trim();

  const messagesForModel: {
    role: "user" | "assistant" | "system";
    content: string;
  }[] = [
      { role: "system", content: systemPrompt },
      ...(history ?? []).reverse().map((m) => ({
        role: m.role as "user" | "assistant", // <-- type assertion here
        content: m.content as string,
      })),
      { role: "user", content: message },
    ];

  /**
   * 5. Call model
   */
  const reply = await callOpenRouterChat({
    model: model ?? DEFAULT_MODEL,
    messages: messagesForModel,
  });

  /**
   * 6. Store both messages in one go
   */
  await supabase.from("chat_messages").insert([
    {
      thread_id: currentThreadId,
      user_id: userId,
      role: "user",
      content: message,
    },
    {
      thread_id: currentThreadId,
      user_id: userId,
      role: "assistant",
      content: reply,
    },
  ]);

  return NextResponse.json({ threadId: currentThreadId, reply });
}
