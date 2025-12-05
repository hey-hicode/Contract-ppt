// app/api/chat/analyses/[analysisId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { callOpenRouterChat, DEFAULT_MODEL } from "~/lib/openrouter";

type Params = { analysisId: string };

type Body = {
  message: string;
  threadId?: string | null;
  model?: string;
  documentText?: string; // optional: full contract text if you have it on the client
  extraInstructions?: string;
};

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, threadId, model, documentText, extraInstructions } = body;
  const { analysisId } = params;

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Load analysis row to build context
  const { data: analysis, error: analysisError } = await supabase
    .from("analyses")
    .select(
      `
      id,
      user_id,
      source_title,
      overall_risk,
      summary,
      red_flags,
      recommendations
    `
    )
    .eq("id", analysisId)
    .single();

  if (analysisError || !analysis) {
    console.error("Analysis not found", analysisError);
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  if (analysis.user_id !== userId) {
    return NextResponse.json(
      { error: "You do not have access to this analysis" },
      { status: 403 }
    );
  }

  // 2. Ensure thread exists (one thread per user+analysis, or reuse provided one)
  let currentThreadId = threadId ?? null;

  if (currentThreadId) {
    const { data: thread, error } = await supabase
      .from("chat_threads")
      .select("id, user_id, analysis_id")
      .eq("id", currentThreadId)
      .single();

    if (
      error ||
      !thread ||
      thread.user_id !== userId ||
      thread.analysis_id !== analysisId
    ) {
      return NextResponse.json(
        { error: "Thread not found or not linked to this analysis" },
        { status: 404 }
      );
    }
  } else {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: userId,
        analysis_id: analysisId,
        title: analysis.source_title ?? "Contract Chat",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to create analysis thread", error);
      return NextResponse.json(
        { error: "Failed to create chat thread" },
        { status: 500 }
      );
    }
    currentThreadId = data.id;
  }

  // 3. Fetch existing messages for this thread
  const { data: history, error: historyError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", currentThreadId)
    .order("created_at", { ascending: true });

  if (historyError) {
    console.error("Failed to fetch chat history", historyError);
  }

  // 4. Build system context using analysis + optional document text
  const redFlagsText = Array.isArray(analysis.red_flags)
    ? analysis.red_flags
        .map(
          (rf: any, idx: number) =>
            `${idx + 1}. [${rf.type ?? "issue"}] ${rf.title ?? ""} - ${
              rf.description ?? ""
            }`
        )
        .join("\n")
    : JSON.stringify(analysis.red_flags ?? {}, null, 2);

  const recommendationsText = Array.isArray(analysis.recommendations)
    ? analysis.recommendations.join("\n- ")
    : String(analysis.recommendations ?? "");

  const systemPrompt = `
You are an AI contract assistant helping the user understand ONE specific contract.

You are given:
- A pre-computed analysis of the contract (summary, overall risk, red flags, recommendations).
- Optionally, the full contract text.

Your job:
- Answer the user's questions based ONLY on this contract and its analysis.
- Be concrete and practical. Explain in simple language.
- If something is unclear or not present in the contract, say that explicitly. Do NOT invent terms or clauses.
- You are NOT a lawyer and are NOT giving formal legal advice. Always frame answers as informational.

Contract title: ${analysis.source_title ?? "Untitled"}
Overall risk: ${analysis.overall_risk ?? "unknown"}

Summary:
${analysis.summary ?? ""}

Key red flags:
${redFlagsText || "None detected"}

Recommendations:
${recommendationsText ? "- " + recommendationsText : "None"}

${
  documentText
    ? `Full contract text (may be long, but use it if needed):\n${documentText}`
    : ""
}

${extraInstructions ?? ""}
`.trim();

  const messagesForModel: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    { role: "system", content: systemPrompt },
    ...(history ?? []).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  try {
    // 5. Store user message first
    const { error: userMsgError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: currentThreadId,
        user_id: userId,
        role: "user",
        content: message,
      });
    if (userMsgError) {
      console.error("Failed to insert user message", userMsgError);
    }

    // 6. Call model
    const reply = await callOpenRouterChat({
      model: model ?? DEFAULT_MODEL,
      messages: messagesForModel,
    });

    // 7. Store assistant message
    const { error: assistantMsgError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: currentThreadId,
        user_id: userId,
        role: "assistant",
        content: reply,
      });

    if (assistantMsgError) {
      console.error("Failed to insert assistant message", assistantMsgError);
    }

    return NextResponse.json({
      threadId: currentThreadId,
      reply,
    });
  } catch (err) {
    console.error("Chat-with-analysis error", err);
    return NextResponse.json(
      { error: "Chat with analysis failed" },
      { status: 500 }
    );
  }
}
