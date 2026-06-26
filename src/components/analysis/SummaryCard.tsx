// src/components/analysis/SummaryCard.tsx
"use client";

interface SummaryCardProps {
  summary: string;
  filename?: string;
}

function DocumentTextIcon() {
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
        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
      />
    </svg>
  );
}

export default function SummaryCard({ summary, filename }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900/50 text-indigo-400">
          <DocumentTextIcon />
        </div>
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Professional Summary
          </h3>
          {filename && (
            <p className="mt-0.5 truncate text-xs text-gray-600" title={filename}>
              {filename}
            </p>
          )}
        </div>
      </div>

      {/* Summary text */}
      <blockquote className="border-l-2 border-indigo-500 pl-4">
        <p className="text-base leading-relaxed text-gray-200">{summary}</p>
      </blockquote>
    </div>
  );
}