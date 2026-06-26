// src/lib/parsers/pdf.ts
//
// Extracts plain text from a PDF buffer using pdf-parse.
//
// IMPORTANT — pdf-parse webpack note:
// Import from the sub-path below, NOT "pdf-parse".
// The top-level import triggers a test-file loader that crashes Next.js builds.
// See next.config.ts for the matching webpack externals entry.

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse/lib/pdf-parse.js") as (
  dataBuffer: Buffer,
  options?: { max?: number }
) => Promise<{ text: string; numpages: number; info: Record<string, unknown> }>;

export interface PdfParseResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts all text from a PDF buffer.
 * Returns the raw text and page count.
 *
 * @param buffer - Raw PDF bytes (from File.arrayBuffer())
 * @throws if pdf-parse cannot read the file
 */
export async function parsePdf(buffer: Buffer): Promise<PdfParseResult> {
  const result = await pdfParse(buffer, {
    // max: 0 means parse all pages
    max: 0,
  });

  return {
    text: sanitiseText(result.text),
    pageCount: result.numpages,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Normalises whitespace produced by pdf-parse:
 * - Collapses runs of spaces/tabs to a single space
 * - Collapses 3+ consecutive newlines to 2 (paragraph breaks)
 * - Trims leading/trailing whitespace
 */
function sanitiseText(raw: string): string {
  return raw
    .replace(/[ \t]+/g, " ")          // collapse horizontal whitespace
    .replace(/\n{3,}/g, "\n\n")       // max 2 consecutive newlines
    .replace(/[ \t]*\n[ \t]*/g, "\n") // strip spaces around newlines
    .trim();
}