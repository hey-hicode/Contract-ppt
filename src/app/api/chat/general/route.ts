// app/api/chat/general/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";
import { callOpenRouterChat, DEFAULT_MODEL } from "~/lib/openrouter";

type Body = {
  message: string;
  threadId?: string | null;
  model?: string;
};

export async function POST(req: NextRequest) {
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

  const { message, threadId, model } = body;

  if (!message || !message.trim()) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Ensure we have a thread
  let currentThreadId = threadId ?? null;

  if (currentThreadId) {
    const { data: thread, error } = await supabase
      .from("chat_threads")
      .select("id, user_id")
      .eq("id", currentThreadId)
      .single();

    if (error || !thread || thread.user_id !== userId) {
      return NextResponse.json(
        { error: "Thread not found or not owned by user" },
        { status: 404 }
      );
    }
  } else {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({
        user_id: userId,
        analysis_id: null,
        title: "General Chat",
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Failed to create thread", error);
      return NextResponse.json(
        { error: "Failed to create thread" },
        { status: 500 }
      );
    }

    currentThreadId = data.id;
  }

  // 2. Get history for this thread
  const { data: history, error: historyError } = await supabase
    .from("chat_messages")
    .select("role, content")
    .eq("thread_id", currentThreadId)
    .order("created_at", { ascending: true });

  if (historyError) {
    console.error("Failed to fetch messages", historyError);
  }

  const systemPrompt = `
You are an AI assistant for a contract analysis app for creators and influencers.
- Be clear, concise, and helpful.
- You can explain legal concepts in plain language but do NOT give formal legal advice.
- If needed, suggest the user consult a qualified lawyer.
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
    // 3. Store the new user message
    const { error: insertUserError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: currentThreadId,
        user_id: userId,
        role: "user",
        content: message,
      });

    if (insertUserError) {
      console.error("Failed to store user message", insertUserError);
    }

    // 4. Call OpenRouter
    const assistantReply = await callOpenRouterChat({
      model: model ?? DEFAULT_MODEL,
      messages: messagesForModel,
    });

    // 5. Store assistant message
    const { error: insertAssistantError } = await supabase
      .from("chat_messages")
      .insert({
        thread_id: currentThreadId,
        user_id: userId,
        role: "assistant",
        content: assistantReply,
      });

    if (insertAssistantError) {
      console.error("Failed to store assistant message", insertAssistantError);
    }

    return NextResponse.json({
      threadId: currentThreadId,
      reply: assistantReply,
    });
  } catch (err) {
    console.error("General chat error", err);
    return NextResponse.json(
      { error: "Chat failed. Please try again." },
      { status: 500 }
    );
  }
}
