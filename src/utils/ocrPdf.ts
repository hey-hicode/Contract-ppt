import { createWorker, OEM } from "tesseract.js";
import { fromBuffer } from "pdf2pic";

const MAX_PAGES = 20;
const DPI = 200;

export async function ocrPdf(buffer: Buffer): Promise<string> {
  const converter = fromBuffer(buffer, {
    density: DPI,
    format: "png",
    width: 1654,
    height: 2339,
  });

  const pages = await converter.bulk(-1, { responseType: "buffer" });

  if (!pages || pages.length === 0) {
    throw new Error("No pages generated for OCR");
  }

  if (pages.length > MAX_PAGES) {
    throw new Error(`OCR page limit exceeded (${pages.length})`);
  }

  const worker = await createWorker(
    "eng",
    OEM.DEFAULT, // or undefined
    {
      logger: () => {}, // optional
    },
  );
  let fullText = "";

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];

    if (!page.buffer) {
      throw new Error(`Missing image buffer for page ${i + 1}`);
    }

    const {
      data: { text },
    } = await worker.recognize(page.buffer);

    fullText += `\n\n--- Page ${i + 1} ---\n\n${text}`;
  }

  await worker.terminate();

  return fullText.trim();
}
