import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { supabase } from "~/lib/supabaseClient";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: threads, error } = await supabase
    .from("chat_threads")
    .select("id, title, created_at")
    .eq("user_id", userId)
    .eq("is_saved", true)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ threads });
}
