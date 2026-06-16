export type AllowedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
 
export type AllowedExtension = "pdf" | "docx";
 
// ── File Validation ──────────────────────────────────────────────────────────
 
export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
}
 
export type FileValidationError =
  | "FILE_TOO_LARGE"
  | "UNSUPPORTED_TYPE"
  | "INVALID_EXTENSION"
  | "EMPTY_FILE";
 
export const FILE_VALIDATION_MESSAGES: Record<FileValidationError, string> = {
  FILE_TOO_LARGE: "File exceeds the 5 MB limit.",
  UNSUPPORTED_TYPE: "Only PDF and DOCX files are supported.",
  INVALID_EXTENSION: "File must have a .pdf or .docx extension.",
  EMPTY_FILE: "File appears to be empty.",
};
 
// ── Upload State ─────────────────────────────────────────────────────────────
 
export type UploadStatus =
  | "idle"       // nothing selected
  | "selected"   // file chosen, not yet uploaded
  | "uploading"  // XHR/fetch in progress
  | "success"    // upload complete
  | "error";     // upload or validation failed
 
export interface UploadState {
  status: UploadStatus;
  file: File | null;
  progress: number;        // 0–100
  errorMessage: string | null;
  resumeId: string | null; // returned by the server on success
}
 
// ── Server Response ──────────────────────────────────────────────────────────
 
export interface UploadResumeResponse {
  success: boolean;
  data: {
    resumeId: string;
    status: "UPLOADED" | "PROCESSING";
    message: string;
  } | null;
  error: string | null;
}
 
// ── Hook Return Type ─────────────────────────────────────────────────────────
 
export interface UseFileUploadReturn {
  uploadState: UploadState;
  isDragging: boolean;
  handleDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  handleDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: () => Promise<void>;
  handleReset: () => void;
}
 
// ── Component Props ──────────────────────────────────────────────────────────
 
export interface DropZoneProps {
  isDragging: boolean;
  status: UploadStatus;
  onDragEnter: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
}
 
export interface FilePreviewProps {
  file: File;
  status: UploadStatus;
  onRemove: () => void;
}
 
export interface UploadProgressProps {
  progress: number;
  status: UploadStatus;
}