import { NextRequest, NextResponse } from "next/server";
import KeplersMailClient from "~/lib/keplers-client";

export const runtime = "nodejs";

const client = new KeplersMailClient(process.env.KEPLERS_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { to, subject, body, analysisId } = await req.json();

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const result = await client.sendEmail({
      to: [to],
      subject,
      body: body.replace(/\n/g, "<br />"),
      is_html: true,
      meta: {
        analysisId,
        source: "contract-analysis",
      },
    });

    return NextResponse.json(
      { success: true, messageId: result?.id },
      { status: 200 },
    );
  } catch (error) {
    console.error("Email send error:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 },
    );
  }
}
