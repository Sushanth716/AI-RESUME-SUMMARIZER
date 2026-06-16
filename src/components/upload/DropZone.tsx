"use client";

import React from "react";

type DropZoneProps = {
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function DropZone({ onFileSelect }: DropZoneProps) {
  return (
    <div className="rounded-2xl border-2 border-dashed border-gray-600 p-10 text-center transition hover:border-indigo-500">
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        onChange={onFileSelect}
        className="mb-4 block w-full cursor-pointer text-sm text-gray-300"
      />

      <h3 className="text-xl font-semibold text-white">
        Upload Your Resume
      </h3>

      <p className="mt-2 text-gray-400">
        Drag & drop your resume or click above
      </p>

      <p className="mt-1 text-sm text-gray-500">
        Supported formats: PDF, DOC, DOCX
      </p>
    </div>
  );
}