// src/components/analysis/RecommendationsCard.tsx
"use client";

interface RecommendationsCardProps {
  recommendations: string[];
}

function LightBulbIcon() {
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
        d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
      />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={2}
      stroke="currentColor"
      className="h-3.5 w-3.5 flex-shrink-0"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
      />
    </svg>
  );
}

export default function RecommendationsCard({
  recommendations,
}: RecommendationsCardProps) {
  return (
    <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-6">
      {/* Header */}
      <div className="mb-5 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-900/50 text-indigo-400">
          <LightBulbIcon />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Recommendations
          </h3>
          <span className="rounded-full bg-indigo-900/50 px-2 py-0.5 text-xs font-medium text-indigo-400">
            {recommendations.length}
          </span>
        </div>
      </div>

      {/* Numbered list */}
      <ol className="space-y-3" role="list">
        {recommendations.map((rec, i) => (
          <li key={i} className="flex items-start gap-3">
            {/* Step number */}
            <span
              className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-indigo-900/60 text-xs font-bold tabular-nums text-indigo-300"
              aria-label={`Step ${i + 1}`}
            >
              {i + 1}
            </span>
            {/* Text + arrow */}
            <span className="flex items-start gap-2 text-sm leading-relaxed text-gray-300">
              <span className="mt-1 text-indigo-500">
                <ArrowRightIcon />
              </span>
              {rec}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}