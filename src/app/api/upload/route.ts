import { type NextRequest, NextResponse } from "next/server";
import { extractText } from "unpdf";

export const config = {
  api: {
    bodyParser: false, // Disable Next.js body parser for file uploads
  },
};

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

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported.", code: "INVALID_FILE_TYPE" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    let text = "";
    try {
      const { text: extractedText } = await extractText(uint8Array);
      text = String(extractedText || "");
    } catch (extractionError: unknown) {
      console.error("PDF text extraction failed:", extractionError);
      return NextResponse.json(
        {
          error: "Failed to extract text from PDF.",
          details:
            extractionError instanceof Error
              ? extractionError.message
              : String(extractionError),
          code: "EXTRACTION_FAILED",
        },
        { status: 500 }
      );
    }

    if (!text || text.trim().length < 50) {
      // Arbitrary minimum text length
      return NextResponse.json(
        {
          error:
            "No sufficient text could be extracted from the PDF. Please ensure it is not an image-only PDF or try copying the text manually.",
          code: "INSUFFICIENT_TEXT",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text }, { status: 200 });
  } catch (error: unknown) {
    console.error("File upload API error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred during file upload.",
      },
      { status: 500 }
    );
  }
}
