import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { callOpenRouterChat, DEFAULT_MODEL } from "~/lib/openrouter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { message, history = [], model } = await req.json();

  if (!message?.trim()) {
    return NextResponse.json({ error: "Message required" }, { status: 400 });
  }

  const systemPrompt = `You are an AI assistant for a contract analysis app.
- Explain clearly.
- Do not give formal legal advice.
- Suggest consulting a lawyer when appropriate.`;

  const reply = await callOpenRouterChat({
    model: model ?? DEFAULT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      ...history,
      { role: "user", content: message },
    ],
  });

  return NextResponse.json({ reply });
}
