import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import mammoth from "mammoth";
import { ocrPdf } from "~/utils/ocrPdf";
import { Mistral } from "@mistralai/mistralai";

const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY });




export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MIN_TEXT_LENGTH = 50;


async function mistralOcrPdf(buffer: Buffer) {
  const base64 = buffer.toString("base64");

  const result = await mistral.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      // Mistral supports base64 “data:” PDFs via document_url
      documentUrl: `data:application/pdf;base64,${base64}`,
    },
    // optional but often useful:
    // table_format: "html", // or "markdown"
    // extract_header: true,
    // extract_footer: true,
    includeImageBase64: false,
  });

  // Most people just join each page’s markdown
  const text = (result.pages ?? [])
    .map((p) => p.markdown ?? "")
    .join("\n\n")
    .trim();

  return text;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded.", code: "NO_FILE" },
        { status: 400 },
      );
    }

    const mime = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    let text = "";

    /* ------------------------
       PDF
       ------------------------ */
    if (mime === "application/pdf") {
      try {
        const { text: extractedText } = await extractText(
          new Uint8Array(buffer),
        );
        text = String(extractedText || "");
      } catch {
        text = "";
      }

   // ✅ OCR fallback
if (!text || text.trim().length < MIN_TEXT_LENGTH) {
  try {
    // 1) try local OCR first (your current behavior)
    text = await ocrPdf(buffer);

    // 2) if still weak, try Mistral OCR
    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
      text = await mistralOcrPdf(buffer);
    }
  } catch {
    // If local OCR threw, still try Mistral as last resort
    try {
      text = await mistralOcrPdf(buffer);
    } catch {
      return NextResponse.json(
        { error: "OCR failed. The document may be unreadable.", code: "OCR_FAILED" },
        { status: 422 },
      );
    }
  }
}

    } else if (
      mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      /* ------------------------
         DOCX
         ------------------------ */
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
      } catch {
        return NextResponse.json(
          {
            error: "Failed to extract text from DOCX.",
            code: "DOCX_EXTRACTION_FAILED",
          },
          { status: 500 },
        );
      }
    } else if (mime === "text/plain" || mime === "text/markdown") {
      /* ------------------------
         TXT / MD
         ------------------------ */
      text = buffer.toString("utf-8");
    } else {
      /* ------------------------
         Unsupported
         ------------------------ */
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload a PDF, DOCX, or TXT file.",
          code: "UNSUPPORTED_FILE_TYPE",
          supported: ["pdf", "docx", "txt", "md"],
        },
        { status: 400 },
      );
    }

    /* ------------------------
       Final validation
       ------------------------ */
    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "No sufficient text could be extracted. The document may be image-based or empty.",
          code: "INSUFFICIENT_TEXT",
        },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        text,
        meta: {
          fileType: mime,
          chars: text.length,
          extractionMethod:
            mime === "application/pdf" && text.length >= MIN_TEXT_LENGTH
              ? "native+ocr"
              : "native",
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected upload error.",
      },
      { status: 500 },
    );
  }
}
