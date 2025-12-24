import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getOrCreateUserPlan } from "~/lib/freemium";

export async function GET() {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const plan = await getOrCreateUserPlan(userId);
  return NextResponse.json(plan);
}
