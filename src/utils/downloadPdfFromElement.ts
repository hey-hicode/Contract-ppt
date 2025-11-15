// utils/downloadPdfFromElement.ts
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

/**
 * Capture a DOM element and download a PDF.
 * @param element HTMLElement
 * @param filename string
 */
export async function downloadElementAsPdf(
  element: HTMLElement,
  filename = "summary.pdf"
) {
  if (!element) throw new Error("No element provided");

  // Increase scale to improve quality
  const scale = 2; // 2x for sharper text
  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: true,
    logging: false,
    windowWidth: document.documentElement.scrollWidth,
    windowHeight: document.documentElement.scrollHeight,
  });

  const imgData = canvas.toDataURL("image/png");

  // A4 = 210 x 297 mm; jsPDF uses points; easier to use portrait pixel-based conversion:
  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  // Convert canvas size to mm for A4 width calculation
  const pageWidthMm = 210;
  const pageHeightMm = 297;

  const imgProps = (pdf as any).getImageProperties(imgData);
  const imgWidthPx = canvas.width;
  const imgHeightPx = canvas.height;

  // calculate the ratio to fit A4 width
  const pxToMm = (mmPerPx: number) => mmPerPx; // we'll compute below
  const ratio =
    pageWidthMm / ((imgWidthPx * (1 / scale) * (72 / 96) * 25.4) / 72); // fallback calculation not required
  // simpler: fit width
  const pdfWidth = pageWidthMm;
  const pdfHeight = imgHeightPx * (pdfWidth / imgWidthPx) * (1 / scale);

  // Add image and split across pages if taller than A4
  let remainingHeight = (imgHeightPx / scale) * (pdfWidth / imgWidthPx);
  let position = 0;
  const imgHeightMm = (imgHeightPx * pdfWidth) / imgWidthPx / scale;

  // Actually a simpler, reliable approach: scale canvas image to page width and slice vertically
  const pageCanvasHeight = Math.floor(
    (canvas.width / pageWidthMm) * pageHeightMm
  ); // not exact; we'll use iterative method below

  // Instead, push full image and add pages: use addImage with appropriate height and addPage for overflow
  const imgWidthMmFinal = pageWidthMm;
  const imgHeightMmFinal = (imgHeightPx * imgWidthMmFinal) / imgWidthPx / scale;

  if (imgHeightMmFinal <= pageHeightMm) {
    pdf.addImage(imgData, "PNG", 0, 0, imgWidthMmFinal, imgHeightMmFinal);
  } else {
    // split into pages — draw the canvas into multiple temporary canvases
    const pageHeightPx = Math.floor(
      ((imgWidthPx * pageHeightMm) / imgWidthMmFinal) * scale
    ); // px per page (approx)
    let y = 0;
    while (y < canvas.height) {
      const pageCanvas = document.createElement("canvas");
      const ctx = pageCanvas.getContext("2d")!;
      const sliceHeight = Math.min(pageHeightPx, canvas.height - y);

      pageCanvas.width = canvas.width;
      pageCanvas.height = sliceHeight;

      // draw slice
      ctx.drawImage(
        canvas,
        0,
        y,
        canvas.width,
        sliceHeight,
        0,
        0,
        canvas.width,
        sliceHeight
      );

      const pageData = pageCanvas.toDataURL("image/png");
      // compute height in mm for this slice
      const sliceHeightMm =
        (sliceHeight * imgWidthMmFinal) / imgWidthPx / scale;

      pdf.addImage(pageData, "PNG", 0, 0, imgWidthMmFinal, sliceHeightMm);

      y += sliceHeight;
      if (y < canvas.height) pdf.addPage();
    }
  }

  pdf.save(filename);
}
