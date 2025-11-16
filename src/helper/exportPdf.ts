import html2canvas from "html2canvas";
import jsPDF from "jspdf";

// quick helper
export async function downloadElementAsPdfSimple(
  el: HTMLElement,
  filename = "summary.pdf"
) {
  const canvas = await html2canvas(el, { scale: 2 });
  const img = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const imgProps = (pdf as any).getImageProperties(img);
  const pdfWidth = 210;
  const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  pdf.addImage(img, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}
