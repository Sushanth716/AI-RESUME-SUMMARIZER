"use client";

type FilePreviewProps = {
  file: File;
  onRemove: () => void;
};

export default function FilePreview({
  file,
  onRemove,
}: FilePreviewProps) {
  const fileSize = (file.size / (1024 * 1024)).toFixed(2);

  return (
    <div className="rounded-2xl border border-gray-700 bg-gray-900 p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">
            {file.name}
          </h3>

          <p className="text-sm text-gray-400">
            {fileSize} MB
          </p>
        </div>

        <button
          onClick={onRemove}
          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          Remove
        </button>
      </div>
    </div>
  );
}