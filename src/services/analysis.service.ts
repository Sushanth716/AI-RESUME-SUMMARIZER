// src/services/analysis.service.ts
//
// Resume analysis via Ollama (local LLM — no API key required).
// Drop-in replacement for the previous Gemini/Anthropic implementation.
// Public surface is unchanged: analyzeResume() → AnalysisServiceResult

import { Ollama } from "ollama";
import {
  ResumeAnalysisSchema,
  MIN_RESUME_CHARS,
  MAX_RESUME_CHARS,
} from "@/types/analysis.types";
import type {
  ResumeAnalysis,
  AnalysisServiceResult,
} from "@/types/analysis.types";

// ── Ollama singleton ───────────────────────────────────────────────────────────

let _client: Ollama | null = null;
function getClient(): Ollama {
  if (!_client) {
    _client = new Ollama({
      host: process.env.OLLAMA_HOST ?? "http://localhost:11434",
    });
  }
  return _client;
}

// ── Model config ───────────────────────────────────────────────────────────────
//
// Recommended models (pull one before starting the app):
//   ollama pull llama3.2       ← fast, good instruction following (default)
//   ollama pull mistral        ← strong at JSON output
//   ollama pull llama3.1:8b    ← more capable, needs more RAM
//   ollama pull phi4-mini      ← very fast on lower-end hardware

const MODEL = process.env.OLLAMA_MODEL ?? "llama3.2";

// ── System prompt ──────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert resume analyst and ATS (Applicant Tracking System) specialist with 15+ years of experience in technical recruiting.
Your task is to analyze the resume text provided by the user and return a structured JSON analysis.

## Output format
You MUST respond with ONLY a valid JSON object.
- No markdown code fences (\`\`\`json ... \`\`\`)
- No explanatory prose before or after the JSON
- No comments inside the JSON
- The JSON must be parseable by JSON.parse() directly

The JSON object must conform to this exact schema:
{
  "atsScore": <integer 0-100>,
  "summary": "<2-4 sentence professional summary of the candidate>",
  "skills": {
    "technical": ["<skill1>", "<skill2>", ...],
    "soft": ["<skill1>", "<skill2>", ...]
  },
  "strengths": ["<strength1>", "<strength2>", ...],
  "weaknesses": ["<weakness1>", "<weakness2>", ...],
  "recommendations": ["<recommendation1>", "<recommendation2>", ...]
}

## Field rules

**atsScore** (0-100 integer)
Score ATS compatibility based on:
- Standard sections present (contact, summary, experience, education, skills): 30 pts
- Industry-standard keywords and terminology: 25 pts
- Quantified achievements (numbers, percentages, impact): 20 pts
- Clear text structure inferred from layout: 15 pts
- Action verbs and active voice throughout: 10 pts

**summary**
2-4 sentences in third person. Include years of experience (if inferable), core expertise, and one notable achievement.

**skills.technical**
Specific technologies, languages, frameworks, tools, platforms. Min 3, max 20 items.

**skills.soft**
Interpersonal, leadership, and transferable skills. Min 2, max 10 items.

**strengths**
3-5 concrete observations about the resume content (not formatting advice).

**weaknesses**
3-5 gaps or areas lacking in the resume (missing sections, vague descriptions, no metrics, etc.).

**recommendations**
4-6 specific, actionable suggestions the candidate can act on immediately.

## Important
- If the text does not appear to be a resume, still return valid JSON but set atsScore to 0 and note "The provided text does not appear to be a resume." in the summary.
- Never add extra keys to the JSON object.
- All array values must be non-empty strings.
- Return ONLY the JSON object. Nothing else.`;

// ── JSON extraction ────────────────────────────────────────────────────────────
//
// Local models are more likely to wrap output in fences despite instructions.
// This strips them defensively before JSON.parse().

function extractJSON(raw: string): string {
  const trimmed = raw.trim();
  const fenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  if (fenceMatch?.[1]) return fenceMatch[1].trim();
  const openFenceMatch = trimmed.match(/^```(?:json)?\s*([\s\S]+)$/i);
  if (openFenceMatch?.[1]) return openFenceMatch[1].trim();
  return trimmed;
}

// ── Core service function ──────────────────────────────────────────────────────

export async function analyzeResume(
  rawResumeText: string
): Promise<AnalysisServiceResult> {
  // ── Input pre-validation ────────────────────────────────────────────────────
  const resumeText = rawResumeText.trim();
  if (resumeText.length < MIN_RESUME_CHARS) {
    return {
      ok: false,
      code: "EMPTY_RESUME",
      message: `Resume text is too short (${resumeText.length} characters). Minimum is ${MIN_RESUME_CHARS} characters.`,
    };
  }

  const textToSend =
    resumeText.length > MAX_RESUME_CHARS
      ? resumeText.slice(0, MAX_RESUME_CHARS)
      : resumeText;

  // ── Ollama API call ─────────────────────────────────────────────────────────
  let rawContent: string | null = null;

  try {
    const client = getClient();

    const response = await client.chat({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Please analyze the following resume and return your analysis as a JSON object:\n\n${textToSend}`,
        },
      ],
      // Disable streaming — we want the full response at once
      stream: false,
    });

    rawContent = response.message.content;
  } catch (err) {
    return classifyOllamaError(err);
  }

  // ── Guard: non-empty response ───────────────────────────────────────────────
  if (!rawContent || rawContent.trim().length === 0) {
    return {
      ok: false,
      code: "PARSE_ERROR",
      message: "Ollama returned an empty response.",
    };
  }

  // ── JSON extraction + parse ─────────────────────────────────────────────────
  const jsonString = extractJSON(rawContent);
  let parsed: unknown;

  try {
    parsed = JSON.parse(jsonString);
  } catch {
    console.error("[analysis.service] JSON.parse failed. Raw response:", rawContent);
    return {
      ok: false,
      code: "PARSE_ERROR",
      message: "Ollama response was not valid JSON. Try switching to a more capable model (e.g. mistral or llama3.1:8b).",
    };
  }

  // ── Zod schema validation ───────────────────────────────────────────────────
  const validation = ResumeAnalysisSchema.safeParse(parsed);
  if (!validation.success) {
    const issues = validation.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    console.error("[analysis.service] Zod validation failed:", issues);
    console.error(
      "[analysis.service] Parsed object:",
      JSON.stringify(parsed, null, 2)
    );
    return {
      ok: false,
      code: "PARSE_ERROR",
      message: `AI response did not match expected schema: ${issues}`,
    };
  }

  return { ok: true, analysis: validation.data as ResumeAnalysis };
}

// ── Ollama error classifier ────────────────────────────────────────────────────

function classifyOllamaError(
  err: unknown
): AnalysisServiceResult & { ok: false } {
  if (err instanceof Error) {
    const msg = err.message ?? "";
    console.error("[analysis.service] Ollama error:", msg);

    // Ollama server not running
    if (
      msg.includes("ECONNREFUSED") ||
      msg.includes("fetch failed") ||
      msg.includes("Failed to fetch")
    ) {
      return {
        ok: false,
        code: "INTERNAL_ERROR",
        message:
          "Cannot connect to Ollama. Make sure it is running: `ollama serve`",
      };
    }

    // Model not pulled yet
    if (msg.includes("model") && (msg.includes("not found") || msg.includes("pull"))) {
      return {
        ok: false,
        code: "INTERNAL_ERROR",
        message: `Model "${MODEL}" is not available. Run: \`ollama pull ${MODEL}\``,
      };
    }

    return {
      ok: false,
      code: "INTERNAL_ERROR",
      message: `Ollama error: ${msg}`,
    };
  }

  console.error("[analysis.service] Unknown error:", err);
  return {
    ok: false,
    code: "INTERNAL_ERROR",
    message: "An unexpected error occurred during AI analysis.",
  };
}