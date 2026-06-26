// src/hooks/useResumeAnalysis.ts
"use client";

import { useCallback, useRef, useState } from "react";
import type { ResumeAnalysis } from "@/types/analysis.types";
import type { UploadApiData } from "@/types/api.types";

// ── State machine ──────────────────────────────────────────────────────────────

export type AnalysisStep =
  | "idle"       // nothing started
  | "uploading"  // POST /api/upload in progress
  | "analyzing"  // POST /api/analyze in progress
  | "complete"   // analysis available
  | "error";     // something failed

export interface AnalysisState {
  step: AnalysisStep;
  /** Upload progress 0-100 (populated during "uploading" step). */
  uploadProgress: number;
  /** Populated when step === "complete". */
  analysis: ResumeAnalysis | null;
  /** Populated when step === "error". */
  error: string | null;
  /** The filename that was analysed. */
  filename: string | null;
}

const INITIAL: AnalysisState = {
  step: "idle",
  uploadProgress: 0,
  analysis: null,
  error: null,
  filename: null,
};

// ── Hook ───────────────────────────────────────────────────────────────────────

export interface UseResumeAnalysisReturn {
  state: AnalysisState;
  /** Start the full pipeline: upload → extract → analyze. */
  analyze: (file: File) => Promise<void>;
  /** Reset back to idle so the user can upload another resume. */
  reset: () => void;
}

export function useResumeAnalysis(): UseResumeAnalysisReturn {
  const [state, setState] = useState<AnalysisState>(INITIAL);
  const abortRef = useRef<AbortController | null>(null);

  // ── Upload step (XHR for progress events) ──────────────────────────────────

  const uploadFile = useCallback(
    (file: File, signal: AbortSignal): Promise<UploadApiData> => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("resume", file);

        const xhr = new XMLHttpRequest();

        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const pct = Math.round((e.loaded / e.total) * 100);
            setState((prev) => ({ ...prev, uploadProgress: pct }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.success && json.data) {
                resolve(json.data as UploadApiData);
              } else {
                reject(new Error(json.error ?? "Upload failed."));
              }
            } catch {
              reject(new Error("Server returned invalid JSON."));
            }
          } else {
            let msg = `Upload failed (${xhr.status}).`;
            try {
              const json = JSON.parse(xhr.responseText);
              if (json.error) msg = json.error;
            } catch {
              // keep default
            }
            reject(new Error(msg));
          }
        });

        xhr.addEventListener("error", () =>
          reject(new Error("Network error during upload."))
        );
        xhr.addEventListener("timeout", () =>
          reject(new Error("Upload timed out."))
        );

        signal.addEventListener("abort", () => {
          xhr.abort();
          reject(new Error("Cancelled."));
        });

        xhr.open("POST", "/api/upload");
        xhr.timeout = 60_000;
        xhr.send(formData);
      });
    },
    []
  );

  // ── Analyze step (fetch, uses AbortSignal natively) ───────────────────────

  const callAnalyzeAPI = useCallback(
    async (resumeText: string, signal: AbortSignal): Promise<ResumeAnalysis> => {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
        signal,
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error ?? `Analysis failed (${res.status}).`);
      }

      return json.data as ResumeAnalysis;
    },
    []
  );

  // ── Public: analyze ────────────────────────────────────────────────────────

  const analyze = useCallback(
    async (file: File) => {
      // Cancel any existing in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        ...INITIAL,
        step: "uploading",
        filename: file.name,
      });

      try {
        // Step 1 — Upload + extract text
        const uploadData = await uploadFile(file, controller.signal);

        // Step 2 — AI analysis
        setState((prev) => ({
          ...prev,
          step: "analyzing",
          uploadProgress: 100,
        }));

        const analysis = await callAnalyzeAPI(
          uploadData.text,
          controller.signal
        );

        setState((prev) => ({
          ...prev,
          step: "complete",
          analysis,
        }));
      } catch (err: unknown) {
        if (
          err instanceof Error &&
          (err.name === "AbortError" || err.message === "Cancelled.")
        ) {
          setState(INITIAL);
          return;
        }
        const message =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setState((prev) => ({
          ...prev,
          step: "error",
          error: message,
        }));
      } finally {
        abortRef.current = null;
      }
    },
    [uploadFile, callAnalyzeAPI]
  );

  // ── Public: reset ──────────────────────────────────────────────────────────

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setState(INITIAL);
  }, []);

  return { state, analyze, reset };
}