// src/lib/server/file-validator.ts
//
// Server-side validation that runs inside the API route.
// Intentionally separate from the client-side utils in src/utils/file-validation.ts
// so they can evolve independently.

export const SERVER_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export const MIME_TO_EXT: Record<string, string> = {
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "docx",
};

// ── Result type ───────────────────────────────────────────────────────────────

export interface ServerFileValidation {
  valid: true;
  ext: string;
}

export interface ServerFileValidationError {
  valid: false;
  message: string;
}

export type ServerValidationResult =
  | ServerFileValidation
  | ServerFileValidationError;

// ── Validator ─────────────────────────────────────────────────────────────────

/**
 * Validates a File object received from `request.formData()`.
 * Checks size, MIME type, and filename extension for defence-in-depth.
 */
export function validateServerFile(file: File): ServerValidationResult {
  // 1. Non-empty
  if (file.size === 0) {
    return { valid: false, message: "Uploaded file is empty." };
  }

  // 2. Size limit
  if (file.size > SERVER_MAX_BYTES) {
    const mb = (SERVER_MAX_BYTES / 1024 / 1024).toFixed(0);
    return {
      valid: false,
      message: `File exceeds the ${mb} MB limit (received ${(file.size / 1024 / 1024).toFixed(2)} MB).`,
    };
  }

  // 3. MIME type
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      valid: false,
      message: `Unsupported file type "${file.type}". Only PDF and DOCX are accepted.`,
    };
  }

  // 4. Extension (defence against spoofed MIME)
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (ext !== "pdf" && ext !== "docx") {
    return {
      valid: false,
      message: `File must have a .pdf or .docx extension (got ".${ext}").`,
    };
  }

  // 5. MIME / extension agreement
  const expectedExt = MIME_TO_EXT[file.type];
  if (expectedExt !== ext) {
    return {
      valid: false,
      message: `MIME type "${file.type}" does not match extension ".${ext}".`,
    };
  }

  return { valid: true, ext };
}