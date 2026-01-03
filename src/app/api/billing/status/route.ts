// app/api/billing/status/route.ts
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabaseClient";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ premium: false }, { status: 401 });

  const { data } = await supabase
    .from("user_plans")
    .select("plan")
    .eq("clerk_user_id", userId)
    .single();

  return NextResponse.json({
    premium: data?.plan === "premium",
  });
}
