import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { supabase } from "~/lib/supabaseClient";

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ onboarding_complete: false });
  }

  const { data, error } = await supabase
    .from("user_profiles")
    .select("onboarding_complete")
    .eq("clerk_id", userId)
    .single();

  if (error || !data) {
    return NextResponse.json({ onboarding_complete: false });
  }

  return NextResponse.json({
    onboarding_complete: data.onboarding_complete,
  });
}
