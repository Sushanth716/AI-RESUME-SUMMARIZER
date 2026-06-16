"use client";
 
import type { UploadProgressProps } from "@/types/resume.types";
 
export default function UploadProgress({ progress, status }: UploadProgressProps) {
  if (status !== "uploading" && status !== "success") return null;
 
  const isComplete = status === "success";
  const clampedProgress = Math.min(100, Math.max(0, progress));
 
  return (
    <div aria-label="Upload progress" role="progressbar" aria-valuenow={clampedProgress} aria-valuemin={0} aria-valuemax={100}>
      {/* Label row */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {isComplete ? "Upload complete" : "Uploading…"}
        </span>
        <span
          className={[
            "text-xs font-semibold tabular-nums",
            isComplete
              ? "text-green-600 dark:text-green-400"
              : "text-indigo-600 dark:text-indigo-400",
          ].join(" ")}
        >
          {clampedProgress}%
        </span>
      </div>
 
      {/* Track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
        {/* Fill */}
        <div
          className={[
            "h-full rounded-full transition-all duration-300 ease-out",
            isComplete
              ? "bg-green-500 dark:bg-green-400"
              : "bg-indigo-500 dark:bg-indigo-400",
            // Animated shimmer during upload
            !isComplete && "relative overflow-hidden",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ width: `${clampedProgress}%` }}
        >
          {/* Shimmer overlay — only shown while uploading */}
          {!isComplete && (
            <span
              aria-hidden="true"
              className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
}