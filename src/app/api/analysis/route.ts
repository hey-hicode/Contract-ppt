// app/api/analysis/route.ts
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  const { userId, orgId } = await auth();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const body = await req.json();
  console.log("Analysis POST body:", body);

  const insertBody = {
    user_id: userId,
    org_id: orgId ?? null,
    source_title: body.sourceTitle ?? null,
    doc_fingerprint: body.docFingerprint ?? null,
    model: body.model ?? null,
    prompt_version: body.promptVersion ?? null,
    overall_risk: body.overallRisk ?? "low",
    summary: body.summary ?? "",
    red_flags: body.redFlags ?? [],
    recommendations: body.recommendations ?? [],
    raw: body ?? {},
  };

  const { data, error } = await supabase
    .from("analyses")
    .insert(insertBody)
    .select("id, created_at")
    .single();

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
