import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callOpenRouterChat, DEFAULT_MODEL } from "~/lib/openrouter";
import { supabase } from "~/lib/supabaseClient";

type Body = {
  message: string;
  threadId?: string | null;
  model?: string;
  saveChat?: boolean;
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // 🔒 BLOCK FREE USERS
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
      { error: "Upgrade to premium to use AI chat." },
      { status: 403 }
    );
  }
  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { message, threadId, model, saveChat } = body;
  if (!message.trim())
    return NextResponse.json({ error: "Message is required" }, { status: 400 });

  let currentThreadId = threadId ?? null;

  // 1. Ensure thread exists
  if (!currentThreadId) {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, title: "General Chat" })
      .select("id")
      .single();

    if (error || !data)
      return NextResponse.json(
        { error: "Failed to create thread" },
        { status: 500 }
      );
    currentThreadId = data.id;
  }

  // 2. Fetch last N messages only
  const { data: history } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", currentThreadId)
    .order("created_at", { ascending: false })
    .limit(15);

  const systemPrompt = `You are an AI assistant for a contract analysis app.
- Explain clearly but don't give formal legal advice.
- Suggest consulting a lawyer if necessary.`;
  const messagesForModel: {
    role: "user" | "assistant" | "system";
    content: string;
  }[] = [
    { role: "system", content: systemPrompt },
    ...(history ?? []).reverse().map((m) => ({
      role: m.role as "user" | "assistant", // <-- type assertion here
      content: m.content,
    })),
    { role: "user", content: message },
  ];

  try {
    // 3. Call AI
    const assistantReply = await callOpenRouterChat({
      model: model ?? DEFAULT_MODEL,
      messages: messagesForModel,
    });

    // 4. Optional batch save
    if (saveChat) {
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
          content: assistantReply,
        },
      ]);
    }

    return NextResponse.json({
      threadId: currentThreadId,
      reply: assistantReply,
    });
  } catch (err) {
    console.error("Chat error", err);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
