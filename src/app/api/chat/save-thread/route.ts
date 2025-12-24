import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { supabase } from "~/lib/supabaseClient";

type Body = {
  threadId?: string;
  messages: { role: "user" | "assistant"; content: string }[];
  title?: string;
};

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { threadId, messages, title } = body;
  let currentThreadId = threadId ?? null;

  // 1. Create thread if it doesn't exist
  if (!currentThreadId) {
    const { data, error } = await supabase
      .from("chat_threads")
      .insert({ user_id: userId, title: title || "New Chat", is_saved: true })
      .select("id")
      .single();

    if (error || !data)
      return NextResponse.json(
        { error: "Failed to create thread" },
        { status: 500 }
      );

    currentThreadId = data.id;
  } else {
    // Update title and ensure thread is marked saved
    await supabase
      .from("chat_threads")
      .update({ title: title || "Saved Chat", is_saved: true })
      .eq("id", currentThreadId);
  }

  // 2. Batch insert messages
  if (messages.length > 0) {
    const insertData = messages.map((m) => ({
      thread_id: currentThreadId,
      user_id: userId,
      role: m.role,
      content: m.content,
    }));

    const { error } = await supabase.from("chat_messages").insert(insertData);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ threadId: currentThreadId });
}
