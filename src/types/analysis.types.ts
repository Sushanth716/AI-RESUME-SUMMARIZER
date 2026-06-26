// src/types/analysis.types.ts
import { z } from "zod";

// ── Zod schema — single source of truth ───────────────────────────────────────
//
// This schema is used for THREE purposes:
//  1. Validating the raw JSON string returned by OpenAI
//  2. Deriving the TypeScript type (no duplication)
//  3. Providing clear error messages when the AI hallucates the wrong shape

export const ResumeAnalysisSchema = z.object({
  atsScore: z
    .number()
    .int()
    .min(0)
    .max(100)
    .describe("ATS compatibility score from 0 to 100"),

  summary: z
    .string()
    .min(1)
    .describe("2-4 sentence professional summary of the candidate"),

  skills: z.object({
    technical: z
      .array(z.string().min(1))
      .describe("Specific technical skills: languages, tools, frameworks"),
    soft: z
      .array(z.string().min(1))
      .describe("Interpersonal and transferable skills"),
  }),

  strengths: z
    .array(z.string().min(1))
    .min(1)
    .describe("Distinct strengths observed in the resume"),

  weaknesses: z
    .array(z.string().min(1))
    .min(1)
    .describe("Areas that could be improved or are missing"),

  recommendations: z
    .array(z.string().min(1))
    .min(1)
    .describe("Concrete, actionable suggestions to improve the resume"),
});

// Infer the TS type from the Zod schema — no manual interface needed
export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>;

// ── API layer types ────────────────────────────────────────────────────────────

export interface AnalyzeRequestBody {
  resumeText: string;
}

export interface AnalyzeApiSuccess {
  success: true;
  data: ResumeAnalysis;
}

export interface AnalyzeApiError {
  success: false;
  error: string;
  code: AnalyzeErrorCode;
}

export type AnalyzeApiResponse = AnalyzeApiSuccess | AnalyzeApiError;

// ── Error codes ───────────────────────────────────────────────────────────────

export type AnalyzeErrorCode =
  | "VALIDATION_ERROR"    // bad/missing request body
  | "EMPTY_RESUME"        // resumeText is blank or too short
  | "OPENAI_AUTH_ERROR"   // invalid or missing API key
  | "OPENAI_RATE_LIMIT"   // 429 from OpenAI
  | "OPENAI_SERVER_ERROR" // 5xx from OpenAI
  | "PARSE_ERROR"         // AI returned malformed / non-conforming JSON
  | "INTERNAL_ERROR";     // unexpected error

// ── Service layer types ───────────────────────────────────────────────────────

export type AnalysisServiceResult =
  | { ok: true; analysis: ResumeAnalysis }
  | { ok: false; code: AnalyzeErrorCode; message: string };

// ── Constants ─────────────────────────────────────────────────────────────────

/** Minimum characters required before we'll call OpenAI. */
export const MIN_RESUME_CHARS = 100;
/** Maximum characters we'll send to OpenAI (avoids runaway token costs). */
export const MAX_RESUME_CHARS = 15_000;