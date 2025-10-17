import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import { v4 as uuidv4 } from "uuid";
import PDFParser from "pdf2json";

type PdfParserEvents = {
  pdfParser_dataError: { parserError?: unknown };
  pdfParser_dataReady: Pdf2JsonDocument;
};

type PdfParserInstance = {
  on<E extends keyof PdfParserEvents>(
    event: E,
    callback: (payload: PdfParserEvents[E]) => void
  ): PdfParserInstance;
  loadPDF: (path: string) => void;
  getRawTextContent: () => string;
};

type Pdf2JsonTextRun = {
  T?: string;
};

type Pdf2JsonText = {
  R?: Pdf2JsonTextRun[];
};

type Pdf2JsonPage = {
  Texts?: Pdf2JsonText[];
};

type Pdf2JsonDocument = {
  formImage?: {
    Pages?: Pdf2JsonPage[];
  };
};

const decodePdfToken = (value?: string) => {
  if (!value) return "";

  try {
    return decodeURIComponent(value);
  } catch (error) {
    console.warn("Failed to decode PDF token", error);
    return value;
  }
};

const fallbackTextFromPdf = (pdfData: Pdf2JsonDocument) => {
  const pages = pdfData.formImage?.Pages ?? [];

  const pageTexts = pages.map((page) => {
    const textElements = page.Texts ?? [];

    const line = textElements
      .map((text) => {
        const runs = text.R ?? [];
        return runs.map((run) => decodePdfToken(run.T)).join("");
      })
      .filter(Boolean)
      .join(" ");

    return line.trim();
  });

  return pageTexts.filter(Boolean).join("\n\n");
};

const extractTextContent = (
  parser: PdfParserInstance,
  pdfData: Pdf2JsonDocument
) => {
  try {
    const text = parser.getRawTextContent();
    if (text.trim().length > 0) {
      return text;
    }
  } catch (error) {
    console.warn("pdf2json raw text extraction failed", error);
  }

  return fallbackTextFromPdf(pdfData);
};

export async function POST(req: NextRequest) {
  const formData: FormData = await req.formData();
  const uploadedFiles = formData.getAll("FILE");
  let fileName = "";
  let parsedText = "";

  if (uploadedFiles && uploadedFiles.length > 0) {
    const uploadedFile = uploadedFiles[0];
    console.log("Uploaded file:", uploadedFile);

    if (uploadedFile instanceof File) {
      fileName = uuidv4();

      const tempFilePath = `/tmp/${fileName}.pdf`;
      const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());

      await fs.writeFile(tempFilePath, fileBuffer);
      const pdfParser: PdfParserInstance = new (PDFParser as unknown as {
        new (...args: unknown[]): PdfParserInstance;
      })(null, 1);

      try {
        parsedText = await new Promise<string>((resolve, reject) => {
          pdfParser.on("pdfParser_dataReady", (pdfData) => {
            try {
              const text = extractTextContent(pdfParser, pdfData);
              resolve(text);
            } catch (error) {
              reject(error);
            }
          });

          pdfParser.on("pdfParser_dataError", (errData) => {
            const error =
              errData.parserError instanceof Error
                ? errData.parserError
                : new Error("Failed to parse PDF file.");
            reject(error);
          });

          pdfParser.loadPDF(tempFilePath);
        });
      } finally {
        await fs.unlink(tempFilePath).catch(() => {
          /* ignore cleanup errors */
        });
      }
    } else {
      console.log("Uploaded file is not in the expected format.");
      return new NextResponse("Uploaded file is not in the expected format.", {
        status: 500,
      });
    }
  } else {
    console.log("No files found.");
    return new NextResponse("No File Found", { status: 404 });
  }

  const response = new NextResponse(parsedText);
  response.headers.set("FileName", fileName);
  return response;
}
