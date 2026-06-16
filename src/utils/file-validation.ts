// Local type definitions (inlined to avoid import resolution issues)
export type AllowedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

export type AllowedExtension = "pdf" | "docx";

export type FileValidationResult = {
  valid: boolean;
  error?: keyof typeof FILE_VALIDATION_MESSAGES | undefined;
};

// ─────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const ALLOWED_EXTENSIONS: AllowedExtension[] = [
  "pdf",
  "docx",
];

export const FILE_VALIDATION_MESSAGES = {
  EMPTY_FILE: "The selected file is empty.",
  FILE_TOO_LARGE: "File size must be less than 5 MB.",
  INVALID_EXTENSION: "Only PDF and DOCX files are supported.",
  UNSUPPORTED_TYPE: "The file format appears invalid or corrupted.",
} as const;

// ─────────────────────────────────────────────────────────────
// Magic Bytes
// ─────────────────────────────────────────────────────────────

// PDF → %PDF
// DOCX → ZIP format (PK\x03\x04)

const MAGIC_BYTES: Record<AllowedExtension, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46],
  docx: [0x50, 0x4b, 0x03, 0x04],
};

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

export function getFileExtension(filename: string): string {
  const ext = filename.toLowerCase().split(".").pop();
  return ext ?? "";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];

  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1
  );

  const value = bytes / Math.pow(1024, i);

  return `${value % 1 === 0 ? value : value.toFixed(1)} ${units[i]}`;
}

async function readMagicBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const buffer = event.target?.result as ArrayBuffer;
      resolve(new Uint8Array(buffer));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file.slice(0, 4));
  });
}

async function hasMagicBytes(
  file: File,
  extension: AllowedExtension
): Promise<boolean> {
  try {
    const bytes = await readMagicBytes(file);
    const expected = MAGIC_BYTES[extension];

    return expected.every(
      (byte, index) => bytes[index] === byte
    );
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// Main Validation
// ─────────────────────────────────────────────────────────────

export async function validateResumeFile(
{ file }: { file: File; }): Promise<FileValidationResult> {
  // Empty file
  if (file.size === 0) {
    return {
      valid: false,
      error: "EMPTY_FILE",
    };
  }

  // File size
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "FILE_TOO_LARGE",
    };
  }

  // Extension
  const extension = getFileExtension(
    file.name
  ) as AllowedExtension;

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: "INVALID_EXTENSION",
    };
  }

  // MIME Type
  if (
    !ALLOWED_MIME_TYPES.includes(
      file.type as AllowedMimeType
    )
  ) {
    return {
      valid: false,
      error: "UNSUPPORTED_TYPE",
    };
  }

  // Magic Byte Validation
  const magicBytesValid = await hasMagicBytes(
    file,
    extension
  );

  if (!magicBytesValid) {
    return {
      valid: false,
      error: "UNSUPPORTED_TYPE",
    };
  }

  return {
    valid: true,
    error: undefined,
  };
}

// ─────────────────────────────────────────────────────────────
// Fast Validation (for drag/drop UI)
// ─────────────────────────────────────────────────────────────

export function quickValidate(
  file: File
): FileValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      error: "EMPTY_FILE",
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "FILE_TOO_LARGE",
    };
  }

  const extension = getFileExtension(file.name);

  if (
    !ALLOWED_EXTENSIONS.includes(
      extension as AllowedExtension
    )
  ) {
    return {
      valid: false,
      error: "INVALID_EXTENSION",
    };
  }

  return {
    valid: true,
    error: undefined,
  };
}