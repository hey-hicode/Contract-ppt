import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "~/lib/supabaseClient";

export async function GET() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("clerk_id", userId)
    .single();

  if (error) {
    console.error("Failed to load user profile:", error);
    return NextResponse.json(
      { error: "Failed to load user profile" },
      { status: 500 }
    );
  }

  return NextResponse.json({ role: data?.role ?? null });
}
