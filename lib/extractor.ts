import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

const MAX_EXTRACTED_CHARS = 15000;

export async function extractTextFromFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const name = file.name.toLowerCase();

  let rawText = '';

  try {
    if (name.endsWith('.pdf')) {
      const parsed = await pdfParse(buffer);
      rawText = parsed.text || '';
    } else if (name.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer });
      rawText = result.value || '';
    } else if (name.endsWith('.md') || name.endsWith('.txt')) {
      rawText = buffer.toString('utf-8');
    } else {
      // Fallback text decoding for plain text / unknown extensions
      rawText = buffer.toString('utf-8');
    }

    if (rawText.length > MAX_EXTRACTED_CHARS) {
      return (
        rawText.slice(0, MAX_EXTRACTED_CHARS) +
        `\n\n[Note: Document truncated to first ${MAX_EXTRACTED_CHARS} characters for research processing]`
      );
    }

    return rawText;
  } catch (error) {
    console.error(`Error extracting text from file ${file.name}:`, error);
    return `[Note: Could not parse content of attached file ${file.name}]`;
  }
}
