import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "~/lib/supabaseClient";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const { role, riskTolerance, goals, contractTypes } = body;

  if (!role || !riskTolerance || !goals?.length || !contractTypes?.length) {
    return NextResponse.json(
      { error: "Incomplete onboarding data" },
      { status: 400 }
    );
  }

  const { error } = await supabase.from("user_profiles").upsert({
    clerk_id: userId,
    role,
    risk_tolerance: riskTolerance,
    goals,
    contract_types: contractTypes,
    onboarding_complete: true,
  });

  if (error) {
    console.error("Onboarding save error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
