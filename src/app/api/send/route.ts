import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { to, subject, body, analysisId } = await req.json();

    if (!to || !subject || !body) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Counselr  <noreply@counselr.io>", // must be verified in Resend
      to: [to],
      subject,
      html: `
        <div style="font-family: system-ui, sans-serif; line-height: 1.6;">
          ${body.replace(/\n/g, "<br />")}
          ${analysisId ? `<hr /><small>Analysis ID: ${analysisId}</small>` : ""}
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return Response.json({ error }, { status: 500 });
    }

    return Response.json({ success: true, data });
  } catch (err) {
    console.error("Email send failed:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
