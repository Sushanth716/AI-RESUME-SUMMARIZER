// src/types/api.types.ts
 
// ── Shared API envelope ────────────────────────────────────────────────────────
 
export interface ApiSuccess<T> {
  success: true;
  data: T;
}
 
export interface ApiError {
  success: false;
  error: string;
  code: ApiErrorCode;
}
 
export type ApiResponse<T> = ApiSuccess<T> | ApiError;
 
export type ApiErrorCode =
  | "VALIDATION_ERROR"   // bad input (wrong type, too large, etc.)
  | "PARSE_ERROR"        // text extraction failed
  | "METHOD_NOT_ALLOWED" // wrong HTTP verb
  | "INTERNAL_ERROR";    // unexpected server error
 
// ── /api/upload ────────────────────────────────────────────────────────────────
 
export interface UploadApiData {
  /** Raw text extracted from the resume. */
  text: string;
  /** Number of characters in the extracted text. */
  charCount: number;
  /** Approximate word count. */
  wordCount: number;
  /** Original filename as submitted by the client. */
  filename: string;
  /** "pdf" | "docx" */
  fileType: string;
  /** File size in bytes. */
  fileSize: number;
}
 
export type UploadApiResponse = ApiResponse<UploadApiData>;