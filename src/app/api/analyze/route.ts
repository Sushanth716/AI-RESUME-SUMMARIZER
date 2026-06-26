// src/app/api/analyze/route.ts

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { analyzeResume } from "@/services/analysis.service";

import type {
  AnalyzeApiResponse,
  AnalyzeErrorCode,
  ResumeAnalysis,
} from "@/types/analysis.types";

import {
  MIN_RESUME_CHARS,
  MAX_RESUME_CHARS,
} from "@/types/analysis.types";

export const runtime = "nodejs";

// Request validation schema
const RequestBodySchema = z.object({
  resumeText: z
    .string()
    .min(
      MIN_RESUME_CHARS,
      `"resumeText" must be at least ${MIN_RESUME_CHARS} characters.`
    )
    .max(
      MAX_RESUME_CHARS,
      `"resumeText" must not exceed ${MAX_RESUME_CHARS} characters.`
    ),
});

// Success response
function ok(
  data: ResumeAnalysis
): NextResponse<AnalyzeApiResponse> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    {
      status: 200,
    }
  );
}

// Error response
function fail(
  error: string,
  code: AnalyzeErrorCode,
  status: number
): NextResponse<AnalyzeApiResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
    },
    {
      status,
    }
  );
}

// Error → HTTP mapping
const ERROR_CODE_TO_HTTP: Record<
  AnalyzeErrorCode,
  number
> = {
  VALIDATION_ERROR: 400,
  EMPTY_RESUME: 422,
  OPENAI_AUTH_ERROR: 500,
  OPENAI_RATE_LIMIT: 429,
  OPENAI_SERVER_ERROR: 502,
  PARSE_ERROR: 422,
  INTERNAL_ERROR: 500,
};

// POST /api/analyze
export async function POST(
  request: NextRequest
): Promise<NextResponse<AnalyzeApiResponse>> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return fail(
      "Request body must be valid JSON.",
      "VALIDATION_ERROR",
      400
    );
  }

  const parsed = RequestBodySchema.safeParse(body);

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(" ");

    return fail(
      message,
      "VALIDATION_ERROR",
      400
    );
  }

  const { resumeText } = parsed.data;

  const result = await analyzeResume(resumeText);

  if (!result.ok) {
    return fail(
      result.message,
      result.code,
      ERROR_CODE_TO_HTTP[result.code] ?? 500
    );
  }

  return ok(result.analysis);
}

// Block GET requests
export async function GET(): Promise<
  NextResponse<AnalyzeApiResponse>
> {
  return fail(
    "Method not allowed. Use POST.",
    "VALIDATION_ERROR",
    405
  );
}