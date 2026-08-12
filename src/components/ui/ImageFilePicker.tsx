import { useEffect, useId, useRef, useState } from "react";
import { Button } from "./Button";

export const REWARD_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp";

function useImagePreview(file: File | null): string | null {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return previewUrl;
}

type ImageFilePickerProps = {
  accept?: string;
  disabled?: boolean;
  value: File | null;
  onChange: (file: File | null) => void;
  chooseLabel: string;
  clearSelectionLabel: string;
  hint?: string;
  previewAlt: string;
  currentImageUrl?: string | null;
  currentImageAlt?: string;
  noCurrentImageLabel?: string;
};

export function ImageFilePicker({
  accept = REWARD_IMAGE_ACCEPT,
  disabled = false,
  value,
  onChange,
  chooseLabel,
  clearSelectionLabel,
  hint,
  previewAlt,
  currentImageUrl,
  currentImageAlt,
  noCurrentImageLabel,
}: ImageFilePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const previewUrl = useImagePreview(value);

  const clearSelection = () => {
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null);
        }}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
        >
          {chooseLabel}
        </Button>
        {value ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={disabled}
            onClick={clearSelection}
          >
            {clearSelectionLabel}
          </Button>
        ) : null}
      </div>

      {value ? (
        <p className="text-xs text-slate-600 dark:text-slate-300">{value.name}</p>
      ) : null}

      {hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}

      {currentImageUrl ? (
        <img
          src={currentImageUrl}
          alt={currentImageAlt || previewAlt}
          className="h-28 w-28 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
        />
      ) : noCurrentImageLabel ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {noCurrentImageLabel}
        </p>
      ) : null}

      {previewUrl ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {previewAlt}
          </p>
          <img
            src={previewUrl}
            alt={previewAlt}
            className="h-28 w-28 rounded-lg border border-slate-200 object-cover dark:border-slate-700"
          />
        </div>
      ) : null}
    </div>
  );
}
