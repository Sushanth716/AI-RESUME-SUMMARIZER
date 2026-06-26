// src/app/api/upload/route.ts
//
// POST /api/upload
//
// Accepts a multipart/form-data request with a "resume" file field.
// Validates, extracts text, and returns a JSON response.
//
// No disk writes — everything is processed in memory.

import { NextRequest, NextResponse } from "next/server";
import { parseResume } from "../../../lib/parsers/index";
import type { UploadApiResponse, UploadApiData, ApiErrorCode } from "../../../types/api.types";

// ── Runtime config ────────────────────────────────────────────────────────────

// Use Node.js runtime so pdf-parse and mammoth (Node.js libraries) are available.
// The default "edge" runtime does not support Node.js built-ins.
export const runtime = "nodejs";

// ── Helpers ───────────────────────────────────────────────────────────────────

function ok(data: UploadApiData): NextResponse<UploadApiResponse> {
  return NextResponse.json<UploadApiResponse>(
    { success: true, data },
    { status: 200 }
  );
}

function err(
  message: string,
  code: ApiErrorCode,
  status: number
): NextResponse<UploadApiResponse> {
  return NextResponse.json<UploadApiResponse>(
    { success: false, error: message, code },
    { status }
  );
}
function validateServerFile(file: File): { valid: true; ext: string } | { valid: false; message: string } {
  const allowedExtensions = ["pdf", "docx", "doc", "txt"];
  const filename = file.name || "";
  const extensionMatch = filename.toLowerCase().match(/\.([a-z0-9]+)$/);

  if (!extensionMatch) {
    return { valid: false, message: "Uploaded file must have a valid file extension." };
  }

  const ext = extensionMatch[1];

  if (!allowedExtensions.includes(ext)) {
    return {
      valid: false,
      message: "Unsupported file type. Only PDF, DOCX, DOC, and TXT files are allowed.",
    };
  }

  if (file.size === 0) {
    return { valid: false, message: "Uploaded file is empty." };
  }

  const maxSizeBytes = 10 * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      message: "Uploaded file is too large. Maximum allowed size is 10 MB.",
    };
  }

  return { valid: true, ext };
}
// ── Handler ───────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  // ── 1. Parse FormData ──────────────────────────────────────────────────────
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return err("Could not parse form data.", "VALIDATION_ERROR", 400);
  }

  const field = formData.get("resume");

  if (!field || !(field instanceof File)) {
    return err(
      'No file received. Send the file in a form field named "resume".',
      "VALIDATION_ERROR",
      400
    );
  }

  const file = field as File;

  // ── 2. Validate ────────────────────────────────────────────────────────────
  const validation = validateServerFile(file);
  if (!validation.valid) {
    return err(validation.message, "VALIDATION_ERROR", 422);
  }

  const { ext } = validation;

  // ── 3. Read into Buffer ────────────────────────────────────────────────────
  let buffer: Buffer;
  try {
    const arrayBuffer = await file.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  } catch {
    return err("Failed to read the uploaded file.", "INTERNAL_ERROR", 500);
  }

  // ── 4. Extract text ────────────────────────────────────────────────────────
  let text: string;
  try {
    const parsed = await parseResume(buffer, ext);
    text = parsed.text;
  } catch (parseError) {
    console.error("[/api/upload] Parse error:", parseError);
    return err(
      "Could not extract text from the uploaded file. The file may be corrupted, password-protected, or contain only images.",
      "PARSE_ERROR",
      422
    );
  }

  // ── 5. Guard: meaningful text ──────────────────────────────────────────────
  if (text.trim().length < 50) {
    return err(
      "The file was parsed but contained too little text. It may be a scanned image or an empty document.",
      "PARSE_ERROR",
      422
    );
  }

  // ── 6. Respond ─────────────────────────────────────────────────────────────
  const words = text.trim().split(/\s+/).filter(Boolean);

  return ok({
    text,
    charCount: text.length,
    wordCount: words.length,
    filename: file.name,
    fileType: ext,
    fileSize: file.size,
  });
}

// ── Block other HTTP verbs ────────────────────────────────────────────────────

export async function GET(): Promise<NextResponse> {
  return err("Method not allowed. Use POST.", "METHOD_NOT_ALLOWED", 405);
}