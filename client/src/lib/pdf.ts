import { jsPDF } from "jspdf";
import type { PainEntry } from "@shared/schema";

export function generatePDF(entries: PainEntry[]) {
  const doc = new jsPDF();
  
  doc.setFontSize(20);
  doc.text("Pain History Report", 20, 20);
  
  let y = 40;
  entries.forEach((entry) => {
    doc.setFontSize(12);
    doc.text(`Date: ${new Date(entry.date).toLocaleDateString()}`, 20, y);
    
    const img = new Image();
    img.src = entry.imageUrl;
    doc.addImage(img, "JPEG", 20, y + 10, 170, 100);
    
    y += 120;
    
    if (y > 250) {
      doc.addPage();
      y = 20;
    }
  });
  
  doc.save("pain-history.pdf");
}
