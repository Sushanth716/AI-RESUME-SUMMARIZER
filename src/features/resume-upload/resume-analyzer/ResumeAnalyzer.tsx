// src/features/resume-analyzer/ResumeAnalyzer.tsx
//
// Top-level feature component. Drop into any page:
//
//   import ResumeAnalyzer from "@/features/resume-analyzer/ResumeAnalyzer";
//   <ResumeAnalyzer />
//
// Internally orchestrates:
//   DropZone (file selection) → useResumeAnalysis (pipeline) → ResumeAnalysisResults
"use client";

import { useState } from "react";
import DropZone from "@/components/upload/DropZone";
import FilePreview from "@/components/upload/FilePreview";
import ResumeAnalysisResults from "@/features/resume-upload/resume-analysis/ResumeAnalysisResults";
import { useResumeAnalysis } from "@/hooks/useResumeAnalysis";
import type { AnalysisStep } from "@/hooks/useResumeAnalysis";

// ── Pipeline step indicator ───────────────────────────────────────────────────

interface PipelineStep {
  id: AnalysisStep;
  label: string;
}

const PIPELINE_STEPS: PipelineStep[] = [
  { id: "uploading", label: "Uploading & extracting text" },
  { id: "analyzing", label: "AI analysis in progress" },
  { id: "complete",  label: "Analysis complete" },
];

function StepIndicator({
  currentStep,
  uploadProgress,
}: {
  currentStep: AnalysisStep;
  uploadProgress: number;
}) {
  const activeIndex = PIPELINE_STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="w-full space-y-3">
      {PIPELINE_STEPS.map((step, i) => {
        const isDone = activeIndex > i || currentStep === "complete";
        const isActive = i === activeIndex && currentStep !== "complete";
        const isPending = i > activeIndex;

        return (
          <div key={step.id} className="flex items-center gap-3">
            {/* Dot */}
            <span
              className={[
                "flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all",
                isDone
                  ? "bg-emerald-500 text-white"
                  : isActive
                  ? "bg-indigo-500 text-white"
                  : "bg-gray-800 text-gray-600",
              ].join(" ")}
              aria-hidden="true"
            >
              {isDone ? "✓" : i + 1}
            </span>

            {/* Label + bar */}
            <div className="flex-1">
              <p
                className={[
                  "text-sm font-medium",
                  isDone
                    ? "text-emerald-400"
                    : isActive
                    ? "text-white"
                    : "text-gray-600",
                ].join(" ")}
              >
                {step.label}
              </p>

              {/* Progress bar for upload step */}
              {isActive && step.id === "uploading" && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                  <div
                    className="h-full rounded-full bg-indigo-500 transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              )}

              {/* Pulsing bar for analyze step */}
              {isActive && step.id === "analyzing" && (
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
                  <div className="h-full w-full animate-pulse rounded-full bg-indigo-500/60" />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Error banner ───────────────────────────────────────────────────────────────

function ErrorBanner({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex flex-col gap-3 rounded-xl border border-red-800/50 bg-red-950/30 px-4 py-3"
    >
      <div className="flex items-start gap-3 text-sm text-red-300">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="mt-0.5 h-5 w-5 flex-shrink-0"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
        <span>{message}</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="self-start rounded-lg bg-red-900/40 px-3 py-1.5 text-xs font-medium text-red-300 transition-colors hover:bg-red-900/70 focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        Try again
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function ResumeAnalyzer() {
  const { state, analyze, reset } = useResumeAnalysis();
  const [file, setFile] = useState<File | null>(null);

  const isProcessing =
    state.step === "uploading" || state.step === "analyzing";

  // ── Handlers ────────────────────────────────────────────────────────────────

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) setFile(selected);
  }

  function handleRemoveFile() {
    setFile(null);
    if (state.step === "error") reset();
  }

  async function handleAnalyze() {
    if (!file || isProcessing) return;
    await analyze(file);
  }

  function handleReset() {
    setFile(null);
    reset();
  }

  // ── Render: complete ────────────────────────────────────────────────────────
  if (state.step === "complete" && state.analysis) {
    return (
      <ResumeAnalysisResults
        analysis={state.analysis}
        filename={state.filename ?? undefined}
        onReset={handleReset}
      />
    );
  }

  // ── Render: upload + idle + error ───────────────────────────────────────────
  return (
    <div className="w-full max-w-xl space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          AI Resume Analyzer
        </h1>
        <p className="text-sm text-gray-400">
          Upload your resume and get an instant ATS score, skills analysis, and
          personalised recommendations.
        </p>
      </div>

      {/* Drop zone (hidden while processing or after file selected) */}
      {!file && !isProcessing && (
        <DropZone onFileSelect={handleFileSelect} />
      )}

      {/* File preview */}
      {file && !isProcessing && state.step !== "complete" && (
        <FilePreview file={file} onRemove={handleRemoveFile} />
      )}

      {/* Error */}
      {state.step === "error" && state.error && (
        <ErrorBanner message={state.error} onRetry={handleReset} />
      )}

      {/* Pipeline step indicator (shown while processing) */}
      {isProcessing && (
        <StepIndicator
          currentStep={state.step}
          uploadProgress={state.uploadProgress}
        />
      )}

      {/* CTA buttons */}
      {file && !isProcessing && state.step !== "complete" && (
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={isProcessing}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/30 transition-all hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-950 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-4 w-4"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
            />
          </svg>
          Analyze Resume
        </button>
      )}
    </div>
  );
}