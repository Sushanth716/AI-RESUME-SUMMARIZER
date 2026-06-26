// src/components/analysis/SkillsCard.tsx
"use client";

interface SkillsCardProps {
  technical: string[];
  soft: string[];
}

// ── Badge ──────────────────────────────────────────────────────────────────────

function SkillBadge({
  label,
  variant,
}: {
  label: string;
  variant: "technical" | "soft";
}) {
  const styles =
    variant === "technical"
      ? "bg-blue-900/40 text-blue-300 border border-blue-800/50"
      : "bg-purple-900/40 text-purple-300 border border-purple-800/50";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${styles}`}
    >
      {label}
    </span>
  );
}

// ── Section ────────────────────────────────────────────────────────────────────

function SkillSection({
  title,
  skills,
  variant,
  dotColor,
}: {
  title: string;
  skills: string[];
  variant: "technical" | "soft";
  dotColor: string;
}) {
  if (skills.length === 0) return null;

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${dotColor}`}
          aria-hidden="true"
        />
        <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {title}
        </h4>
        <span className="ml-auto text-xs text-gray-600">
          {skills.length} skill{skills.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge key={skill} label={skill} variant={variant} />
        ))}
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

function CodeBracketIcon() {
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
        d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"
      />
    </svg>
  );
}

export default function SkillsCard({ technical, soft }: SkillsCardProps) {
  const totalSkills = technical.length + soft.length;

  return (
    <div className="rounded-2xl border border-white/10 bg-gray-900/60 p-6">
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-900/50 text-blue-400">
            <CodeBracketIcon />
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-widest text-gray-400">
            Skills
          </h3>
        </div>
        <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs text-gray-400">
          {totalSkills} total
        </span>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        <SkillSection
          title="Technical"
          skills={technical}
          variant="technical"
          dotColor="bg-blue-400"
        />
        {technical.length > 0 && soft.length > 0 && (
          <hr className="border-white/5" />
        )}
        <SkillSection
          title="Soft Skills"
          skills={soft}
          variant="soft"
          dotColor="bg-purple-400"
        />
      </div>
    </div>
  );
}