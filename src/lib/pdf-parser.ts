/**
 * PDF parsing utilities using Mozilla's PDF.js, which is browser-compatible
 * This file handles extracting text content from PDF files in the browser environment
 */
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source path for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

/**
 * Extract text content from a PDF file
 */
export async function extractTextFromPDF(pdfFile: File): Promise<string> {
  try {
    const arrayBuffer = await pdfFile.arrayBuffer();
    
    // Load the PDF document using PDF.js
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    
    let fullText = '';
    
    // Extract text from all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
}