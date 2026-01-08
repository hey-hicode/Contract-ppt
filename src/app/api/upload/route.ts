import { NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";
import mammoth from "mammoth";

export const dynamic = "force-dynamic";

const MIN_TEXT_LENGTH = 50;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded.", code: "NO_FILE" },
        { status: 400 }
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
          new Uint8Array(buffer)
        );
        text = String(extractedText || "");
      } catch (err) {
        return NextResponse.json(
          {
            error: "Failed to extract text from PDF.",
            code: "PDF_EXTRACTION_FAILED",
          },
          { status: 500 }
        );
      }
    } else if (

    /* ------------------------
       DOCX
       ------------------------ */
      mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      try {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value || "";
      } catch (err) {
        return NextResponse.json(
          {
            error: "Failed to extract text from DOCX.",
            code: "DOCX_EXTRACTION_FAILED",
          },
          { status: 500 }
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
        { status: 400 }
      );
    }

    /* ------------------------
       Validation
       ------------------------ */
    if (!text || text.trim().length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "No sufficient text could be extracted. The document may be image-based or empty.",
          code: "INSUFFICIENT_TEXT",
        },
        { status: 422 }
      );
    }

    return NextResponse.json(
      {
        text,
        meta: {
          fileType: mime,
          chars: text.length,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unexpected upload error.",
      },
      { status: 500 }
    );
  }
}
