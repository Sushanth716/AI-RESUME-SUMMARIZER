// src/features/resume-analysis/ResumeAnalysisResults.tsx
"use client";

import ATSScoreCard from "@/components/analysis/ATSScoreCard";
import SummaryCard from "@/components/analysis/SummaryCard";
import SkillsCard from "@/components/analysis/SkillsCard";
import StrengthsCard from "@/components/analysis/StrengthsCard";
import WeaknessesCard from "@/components/analysis/WeaknessesCard";
import RecommendationsCard from "@/components/analysis/RecommendationsCard";
import type { ResumeAnalysis } from "@/types/analysis.types";

interface ResumeAnalysisResultsProps {
  analysis: ResumeAnalysis;
  filename?: string;
  onReset: () => void;
}

function RefreshIcon() {
  return (
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
        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
      />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z"
      />
    </svg>
  );
}

export default function ResumeAnalysisResults({
  analysis,
  filename,
  onReset,
}: ResumeAnalysisResultsProps) {
  const { atsScore, summary, skills, strengths, weaknesses, recommendations } =
    analysis;

  return (
    <section
      aria-label="Resume analysis results"
      className="w-full space-y-6"
    >
      {/* ── Results header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-indigo-400">
            <SparklesIcon />
          </span>
          <div>
            <h2 className="text-lg font-semibold text-white">
              Analysis Complete
            </h2>
            {filename && (
              <p
                className="max-w-xs truncate text-xs text-gray-500"
                title={filename}
              >
                {filename}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-800 px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <RefreshIcon />
          Analyze another
        </button>
      </div>

      {/* ── Row 1: ATS score + summary ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* ATS score takes 1 column */}
        <div className="md:col-span-1">
          <ATSScoreCard score={atsScore} />
        </div>
        {/* Summary takes 2 columns */}
        <div className="md:col-span-2">
          <SummaryCard summary={summary} filename={filename} />
        </div>
      </div>

      {/* ── Row 2: Skills (full width) ──────────────────────────────────────── */}
      <SkillsCard
        technical={skills.technical}
        soft={skills.soft}
      />

      {/* ── Row 3: Strengths + Weaknesses ───────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StrengthsCard strengths={strengths} />
        <WeaknessesCard weaknesses={weaknesses} />
      </div>

      {/* ── Row 4: Recommendations (full width) ─────────────────────────────── */}
      <RecommendationsCard recommendations={recommendations} />
    </section>
  );
}