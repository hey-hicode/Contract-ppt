import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "~/lib/supabaseClient";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { userId } = await auth();
  const { threadId } = await params;
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select("role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ messages });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { threadId } = await params;

  await supabase.from("chat_messages").delete().eq("thread_id", threadId);
  await supabase
    .from("chat_threads")
    .delete()
    .eq("id", threadId)
    .eq("user_id", userId);

  return NextResponse.json({ success: true });
}
