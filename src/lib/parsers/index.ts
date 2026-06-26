// src/lib/parsers/index.ts
//
// Single entry-point for resume text extraction.
// Routes to the correct parser based on file extension.

import { parsePdf } from "./pdf";
import { parseDocx } from "./docx";

export interface ParseResumeResult {
  text: string;
  warnings?: string[];
}

/**
 * Extracts plain text from a PDF or DOCX file buffer.
 *
 * @param buffer  - Raw file bytes
 * @param ext     - Lowercase extension: "pdf" | "docx"
 * @throws        if extraction fails or ext is unsupported
 */
export async function parseResume(
  buffer: Buffer,
  ext: string
): Promise<ParseResumeResult> {
  switch (ext) {
    case "pdf": {
      const result = await parsePdf(buffer);
      return { text: result.text };
    }

    case "docx": {
      const result = await parseDocx(buffer);
      return {
        text: result.text,
        warnings: result.warnings.length > 0 ? result.warnings : undefined,
      };
    }

    default:
      throw new Error(
        `Unsupported extension "${ext}". Only "pdf" and "docx" are supported.`
      );
  }
}

// Re-export individual parsers for direct use if needed
export { parsePdf } from "./pdf";
export { parseDocx } from "./docx";
export {};