// app/api/analysis/[id]/route.ts
import { NextRequest } from "next/server";
import { auth } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return jsonResponse({ error: "Missing id" }, 400);

  try {
    const { data, error } = await supabase
      .from("analyses")
      .select(
        `
        id,
        user_id,
        org_id,
        source_title,
        doc_fingerprint,
        model,
        prompt_version,
        overall_risk,
        summary,
        red_flags,
        recommendations,
        raw,
        created_at
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      // 404 vs other errors
      if (error.code === "PGRST116") {
        return jsonResponse({ error: "Not found" }, 404);
      }
      console.error("Supabase GET error:", error);
      return jsonResponse({ error: "Database error" }, 500);
    }

    // Protect: ensure the requesting user owns the record (or you can add org-share logic)
    if (data.user_id !== userId) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    // Map DB fields (snake_case) to client-friendly shape if you prefer
    const mapped = {
      id: data.id,
      userId: data.user_id,
      orgId: data.org_id,
      sourceTitle: data.source_title,
      docFingerprint: data.doc_fingerprint,
      model: data.model,
      promptVersion: data.prompt_version,
      overallRisk: data.overall_risk,
      summary: data.summary,
      redFlags: data.red_flags ?? [],
      recommendations: data.recommendations ?? [],
      raw: data.raw ?? null,
      createdAt: data.created_at,
    };

    return jsonResponse(mapped, 200);
  } catch (err) {
    console.error("Unexpected GET error:", err);
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return jsonResponse({ error: "Unauthorized" }, 401);

  const url = new URL(req.url);
  const id = url.pathname.split("/").pop();
  if (!id) return jsonResponse({ error: "Missing id" }, 400);

  try {
    // Ensure the row exists and belongs to the user
    const { data: existing, error: getErr } = await supabase
      .from("analyses")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (getErr) {
      if (getErr.code === "PGRST116") {
        return jsonResponse({ error: "Not found" }, 404);
      }
      console.error("Supabase GET-for-delete error:", getErr);
      return jsonResponse({ error: "Database error" }, 500);
    }

    if (!existing || existing.user_id !== userId) {
      return jsonResponse({ error: "Forbidden" }, 403);
    }

    const { data, error } = await supabase
      .from("analyses")
      .delete()
      .eq("id", id)
      .select("id")
      .single();

    if (error) {
      console.error("Supabase DELETE error:", error);
      return jsonResponse({ error: "Failed to delete" }, 500);
    }

    return jsonResponse({ id: data.id }, 200);
  } catch (err) {
    console.error("Unexpected DELETE error:", err);
    return jsonResponse({ error: "Unexpected server error" }, 500);
  }
}
