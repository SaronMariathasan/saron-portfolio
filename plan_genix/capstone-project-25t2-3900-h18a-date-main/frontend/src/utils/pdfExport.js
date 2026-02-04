import domtoimage from "dom-to-image-more";
import jsPDF from "jspdf";

// ===== PDF Export Handler =====
export async function handleExportPDF(ref, filename = "your-plan.pdf") {
  if (!ref.current) return;

  document.body.classList.add("pdf-export-mode");
  await document.fonts.ready;
  const dataUrl = await domtoimage.toPng(ref.current, {
    quality: 1,
    style: {
      margin: "4px",
      padding: "0px",
      background: "white",

    },
    height: ref.current.scrollHeight,
    width: ref.current.scrollWidth,
  });

  document.body.classList.remove("pdf-export-mode");

  const img = new Image();
  img.src = dataUrl;
  img.onload = () => {
    const pdf = new jsPDF("portrait", "pt", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const scale = Math.min(
      (pageWidth - 10), // 5pt padding on each side
      (pageHeight - 10) * (img.width / img.height)
    ) / img.width;

    const imgWidth = img.width * scale;
    const imgHeight = img.height * scale;

    const x = (pageWidth - imgWidth) / 2;
    const y = 10;

    pdf.addImage(img, "PNG", x, y, imgWidth, imgHeight);
    pdf.save(filename);
  };
}