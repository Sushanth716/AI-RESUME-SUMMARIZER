"use client";

import { useCallback, useRef, useState } from "react";
import {
  validateResumeFile,
  quickValidate,
  FILE_VALIDATION_MESSAGES,
} from "@/utils/file-validation";

export type UploadStatus =
  | "idle"
  | "selected"
  | "uploading"
  | "success"
  | "error";

export interface UploadState {
  status: UploadStatus;
  file: File | null;
  progress: number;
  errorMessage: string | null;
}

const INITIAL_STATE: UploadState = {
  status: "idle",
  file: null,
  progress: 0,
  errorMessage: null,
};

export function useFileUpload() {
  const [uploadState, setUploadState] =
    useState<UploadState>(INITIAL_STATE);

  const [isDragging, setIsDragging] = useState(false);

  const dragCounterRef = useRef(0);

  const selectFile = useCallback(async (file: File) => {
    const quick = quickValidate(file);

    if (!quick.valid) {
      setUploadState({
        ...INITIAL_STATE,
        status: "error",
        errorMessage:
          FILE_VALIDATION_MESSAGES[
            quick.error as keyof typeof FILE_VALIDATION_MESSAGES
          ],
      });

      return;
    }

    setUploadState({
      status: "selected",
      file,
      progress: 0,
      errorMessage: null,
    });

    const full = await validateResumeFile({ file });

    if (!full.valid) {
      setUploadState({
        ...INITIAL_STATE,
        status: "error",
        errorMessage:
          FILE_VALIDATION_MESSAGES[
            full.error as keyof typeof FILE_VALIDATION_MESSAGES
          ],
      });
    }
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragCounterRef.current++;

      if (dragCounterRef.current === 1) {
        setIsDragging(true);
      }
    },
    []
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      dragCounterRef.current--;

      if (dragCounterRef.current === 0) {
        setIsDragging(false);
      }
    },
    []
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "copy";
    },
    []
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();

      dragCounterRef.current = 0;
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];

      if (file) {
        selectFile(file);
      }
    },
    [selectFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];

      if (file) {
        selectFile(file);
      }

      e.target.value = "";
    },
    [selectFile]
  );

  const handleUpload = useCallback(() => {
    setUploadState((prev) => ({
      ...prev,
      status: "success",
      progress: 100,
    }));
  }, []);

  const handleReset = useCallback(() => {
    dragCounterRef.current = 0;
    setIsDragging(false);
    setUploadState(INITIAL_STATE);
  }, []);

  return {
    uploadState,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop,
    handleFileSelect,
    handleUpload,
    handleReset,
  };
}