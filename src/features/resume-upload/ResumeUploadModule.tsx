"use client";

import { useState } from "react";
import DropZone from "@/components/upload/DropZone";
import FilePreview from "@/components/upload/FilePreview";

export default function ResumeUploadModule() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    setFile(selectedFile);
  };

  const handleRemove = () => {
    setFile(null);
  };

  const handleAnalyze = () => {
    alert("Resume analysis feature coming next!");
  };

  return (
    <section className="w-full max-w-xl space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">
          AI Resume Analyzer
        </h2>

        <p className="mt-2 text-gray-400">
          Upload your resume and get AI-powered insights,
          ATS scoring, skill analysis, and recommendations.
        </p>
      </div>

      {!file ? (
        <DropZone onFileSelect={handleFileSelect} />
      ) : (
        <FilePreview
          file={file}
          onRemove={handleRemove}
        />
      )}

      {file && (
        <button
          onClick={handleAnalyze}
          className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Analyze Resume
        </button>
      )}
    </section>
  );
}