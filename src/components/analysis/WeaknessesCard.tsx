// src/components/analysis/WeaknessesCard.tsx
"use client";

interface WeaknessesCardProps {
  weaknesses: string[];
}

function AlertTriangleIcon() {
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
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  );
}

function DotIcon() {
  return (
    <svg
      viewBox="0 0 6 6"
      fill="currentColor"
      className="h-1.5 w-1.5 flex-shrink-0"
      aria-hidden="true"
    >
      <circle cx="3" cy="3" r="3" />
    </svg>
  );
}

export default function WeaknessesCard({ weaknesses }: WeaknessesCardProps) {
  return (
    <div className="rounded-2xl border border-orange-900/40 bg-orange-950/20 p-6">
      {/* Header */}
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-900/50 text-orange-400">
          <AlertTriangleIcon />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Areas to Improve
          </h3>
          <span className="rounded-full bg-orange-900/50 px-2 py-0.5 text-xs font-medium text-orange-400">
            {weaknesses.length}
          </span>
        </div>
      </div>

      {/* List */}
      <ul className="space-y-3" role="list">
        {weaknesses.map((weakness, i) => (
          <li key={i} className="flex items-start gap-3">
            <span className="mt-1.5 flex flex-shrink-0 items-center text-orange-500">
              <DotIcon />
            </span>
            <span className="text-sm leading-relaxed text-gray-300">
              {weakness}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}