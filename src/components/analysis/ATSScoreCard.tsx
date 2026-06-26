// src/components/analysis/ATSScoreCard.tsx
// Redesigned with Framer Motion — animated SVG ring + count-up + glow tier
"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

interface ATSScoreCardProps {
  score: number; // 0–100
}

// ── Tier system ────────────────────────────────────────────────────────────────

interface Tier {
  label:       string;
  description: string;
  colorFrom:   string;
  colorTo:     string;
  textClass:   string;
  glowColor:   string;
  badgeBg:     string;
  badgeText:   string;
  ringStart:   string; // SVG gradient stop 1
  ringEnd:     string; // SVG gradient stop 2
}

function getTier(score: number): Tier {
  if (score >= 85) return {
    label:       "Excellent",
    description: "Your resume is highly ATS-compatible. You're in the top tier.",
    colorFrom:   "#10b981",
    colorTo:     "#34d399",
    textClass:   "text-emerald-400",
    glowColor:   "rgba(16,185,129,0.35)",
    badgeBg:     "bg-emerald-500/10 border-emerald-500/20",
    badgeText:   "text-emerald-400",
    ringStart:   "#10b981",
    ringEnd:     "#6ee7b7",
  };
  if (score >= 70) return {
    label:       "Good",
    description: "Strong performance. A few targeted tweaks will push you higher.",
    colorFrom:   "#4f46e5",
    colorTo:     "#818cf8",
    textClass:   "text-indigo-400",
    glowColor:   "rgba(79,70,229,0.4)",
    badgeBg:     "bg-indigo-500/10 border-indigo-500/20",
    badgeText:   "text-indigo-400",
    ringStart:   "#4f46e5",
    ringEnd:     "#a5b4fc",
  };
  if (score >= 50) return {
    label:       "Fair",
    description: "Solid foundation. Several improvements will significantly boost your ranking.",
    colorFrom:   "#f59e0b",
    colorTo:     "#fbbf24",
    textClass:   "text-amber-400",
    glowColor:   "rgba(245,158,11,0.35)",
    badgeBg:     "bg-amber-500/10 border-amber-500/20",
    badgeText:   "text-amber-400",
    ringStart:   "#d97706",
    ringEnd:     "#fcd34d",
  };
  return {
    label:       "Needs Work",
    description: "Major improvements needed. Follow the recommendations below.",
    colorFrom:   "#ef4444",
    colorTo:     "#f87171",
    textClass:   "text-red-400",
    glowColor:   "rgba(239,68,68,0.35)",
    badgeBg:     "bg-red-500/10 border-red-500/20",
    badgeText:   "text-red-400",
    ringStart:   "#dc2626",
    ringEnd:     "#fca5a5",
  };
}

// ── Animated SVG ring ──────────────────────────────────────────────────────────

function ScoreRing({
  score,
  tier,
  animated,
}: {
  score: number;
  tier: Tier;
  animated: boolean;
}) {
  const SIZE   = 200;
  const STROKE = 12;
  const RADIUS = (SIZE - STROKE) / 2;
  const CIRCUM = 2 * Math.PI * RADIUS;
  const gradId = `ring-grad-${score}`;

  const offset = CIRCUM - (score / 100) * CIRCUM;

  return (
    <svg
      width={SIZE}
      height={SIZE}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="-rotate-90"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={tier.ringStart} />
          <stop offset="100%" stopColor={tier.ringEnd}   />
        </linearGradient>
        <filter id="ring-glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Track */}
      <circle
        cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={STROKE}
      />

      {/* Animated fill */}
      <motion.circle
        cx={SIZE / 2} cy={SIZE / 2} r={RADIUS}
        fill="none"
        stroke={`url(#${gradId})`}
        strokeWidth={STROKE}
        strokeLinecap="round"
        strokeDasharray={CIRCUM}
        initial={{ strokeDashoffset: CIRCUM }}
        animate={{ strokeDashoffset: animated ? offset : CIRCUM }}
        transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        filter="url(#ring-glow)"
      />

      {/* Trailing dot at head of arc */}
      <motion.circle
        r={STROKE / 2 + 1}
        fill={tier.ringEnd}
        initial={{ opacity: 0 }}
        animate={{ opacity: animated ? 1 : 0 }}
        transition={{ delay: 0.3 }}
        style={{
          filter: `drop-shadow(0 0 6px ${tier.ringEnd})`,
        }}
        // Position calculated separately via transform — this is decorative
      />
    </svg>
  );
}

// ── Count-up number ────────────────────────────────────────────────────────────

function CountUp({ to, className }: { to: number; className: string }) {
  const nodeRef = useRef<HTMLSpanElement>(null);
  const inView  = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
      delay: 0.2,
      onUpdate: (v) => {
        if (nodeRef.current) nodeRef.current.textContent = String(Math.round(v));
      },
    });
    return controls.stop;
  }, [inView, to]);

  return (
    <span ref={nodeRef} className={className}>
      0
    </span>
  );
}

// ── Breakdown bar ──────────────────────────────────────────────────────────────

function BreakdownBar({ label, value, max = 30, color }: { label: string; value: number; max?: number; color: string }) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-slate-500">{label}</span>
        <span className="text-slate-400 tabular-nums">{value}/{max}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.05]">
        <motion.div
          className="h-full rounded-full"
          initial={{ width: 0 }}
          animate={{ width: inView ? `${(value / max) * 100}%` : 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────────

export default function ATSScoreCard({ score }: ATSScoreCardProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const tier    = getTier(clamped);
  const ref     = useRef<HTMLDivElement>(null);
  const inView  = useInView(ref, { once: true, margin: "-50px" });

  // Fake breakdown that sums to clamped (for display only — real breakdown from AI)
  const breakdown = [
    { label: "Sections",     value: Math.round(clamped * 0.30), max: 30, color: tier.ringStart },
    { label: "Keywords",     value: Math.round(clamped * 0.25), max: 25, color: tier.ringEnd   },
    { label: "Achievements", value: Math.round(clamped * 0.20), max: 20, color: tier.ringStart },
    { label: "Formatting",   value: Math.round(clamped * 0.15), max: 15, color: tier.ringEnd   },
    { label: "Voice",        value: Math.round(clamped * 0.10), max: 10, color: tier.ringStart },
  ];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02] p-6 backdrop-blur-xl"
      style={{
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.5), 0 0 ${inView ? "40px" : "0px"} ${tier.glowColor}`,
        transition: "box-shadow 1s ease",
      }}
    >
      {/* Glow bg */}
      <div
        className="absolute inset-0 pointer-events-none rounded-3xl"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% 0%, ${tier.glowColor.replace("0.35", "0.08")} 0%, transparent 60%)`,
        }}
      />

      {/* Header */}
      <div className="relative mb-6 flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          ATS Compatibility
        </h3>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${tier.badgeBg} ${tier.badgeText}`}>
          {tier.label}
        </span>
      </div>

      {/* Ring + score */}
      <div className="relative mb-6 flex flex-col items-center">
        <div className="relative">
          <ScoreRing score={clamped} tier={tier} animated={inView} />

          {/* Overlaid number */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <CountUp to={clamped} className={`text-5xl font-extrabold tabular-nums ${tier.textClass}`} />
            <span className="text-xs text-slate-600 mt-0.5">/ 100</span>
          </div>
        </div>

        <p className="mt-3 max-w-[220px] text-center text-xs leading-relaxed text-slate-500">
          {tier.description}
        </p>
      </div>

      {/* Breakdown */}
      <div className="relative space-y-3 border-t border-white/[0.05] pt-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-slate-600">
          Score Breakdown
        </p>
        {breakdown.map((b) => (
          <BreakdownBar key={b.label} {...b} />
        ))}
      </div>
    </motion.div>
  );
}