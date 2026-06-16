import type { UploadResumeResponse } from "@/types/resume.types";
 
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
 
// ── Types ────────────────────────────────────────────────────────────────────
 
export interface UploadOptions {
  /** Called with a value from 0–100 as the upload progresses. */
  onProgress?: (percent: number) => void;
  /** AbortSignal to cancel the request mid-flight. */
  signal?: AbortSignal;
}
 
export class ResumeServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = "ResumeServiceError";
  }
}
 
// ── Service ──────────────────────────────────────────────────────────────────
 
/**
 * Uploads a resume file to the backend.
 *
 * Uses XMLHttpRequest so we get granular progress events.
 * Falls back gracefully when the progress callback is not provided.
 *
 * @throws {ResumeServiceError} on network errors or non-2xx responses.
 */
export async function uploadResume(
  file: File,
  options: UploadOptions = {}
): Promise<UploadResumeResponse> {
  const { onProgress, signal } = options;
 
  const formData = new FormData();
  formData.append("resume", file);
 
  return new Promise<UploadResumeResponse>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
 
    // ── Progress ────────────────────────────────────────────────────────────
    if (onProgress) {
      xhr.upload.addEventListener("progress", (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          onProgress(percent);
        }
      });
    }
 
    // ── Completion ──────────────────────────────────────────────────────────
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText) as UploadResumeResponse;
          resolve(json);
        } catch {
          reject(
            new ResumeServiceError("Invalid response from server.", xhr.status)
          );
        }
      } else {
        let message = `Upload failed (${xhr.status}).`;
        try {
          const err = JSON.parse(xhr.responseText) as { error?: string };
          if (err.error) message = err.error;
        } catch {
          // leave default message
        }
        reject(new ResumeServiceError(message, xhr.status));
      }
    });
 
    // ── Network Error ───────────────────────────────────────────────────────
    xhr.addEventListener("error", () => {
      reject(
        new ResumeServiceError(
          "Network error. Please check your connection and try again."
        )
      );
    });
 
    // ── Timeout ─────────────────────────────────────────────────────────────
    xhr.addEventListener("timeout", () => {
      reject(new ResumeServiceError("Request timed out. Please try again."));
    });
 
    // ── AbortSignal integration ─────────────────────────────────────────────
    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new ResumeServiceError("Upload cancelled."));
      });
    }
 
    // ── Send ────────────────────────────────────────────────────────────────
    xhr.open("POST", `${API_BASE_URL}/resumes/upload`);
 
    // Attach stored access token if present (adjust key to your auth setup)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null;
    if (token) {
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    }
 
    xhr.timeout = 60_000; // 60 s
    xhr.send(formData);
  });
}