import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import mammoth from "mammoth";

// PDF.js Worker Configuration
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export const parseResumeFile = async (file: File): Promise<string> => {
  try {
    if (file.type === "application/pdf") {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let text = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        text += content.items.map((s: any) => s.str).join(" ") + "\n";
      }
      return text;
    } else if (file.name.endsWith(".docx")) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value;
    }
    throw new Error("Unsupported file format");
  } catch (err) {
    console.error("File parsing error:", err);
    throw err;
  }
};
