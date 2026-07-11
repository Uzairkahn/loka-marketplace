'use client';

import { useCallback, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import clsx from 'clsx';

const MAX_FILES = 6;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ImageUploaderProps {
  files: File[];
  onChange: (files: File[]) => void;
  existingImageUrls?: string[];
  error?: string;
}

export default function ImageUploader({ files, onChange, existingImageUrls = [], error }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const totalCount = files.length + existingImageUrls.length;

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      setLocalError(null);
      const incomingArray = Array.from(incoming);

      const valid: File[] = [];
      for (const file of incomingArray) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          setLocalError(`"${file.name}" isn't a supported format (JPEG, PNG, WEBP only)`);
          continue;
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setLocalError(`"${file.name}" exceeds ${MAX_SIZE_MB}MB`);
          continue;
        }
        valid.push(file);
      }

      const combined = [...files, ...valid].slice(0, MAX_FILES - existingImageUrls.length);
      if (files.length + valid.length + existingImageUrls.length > MAX_FILES) {
        setLocalError(`You can upload up to ${MAX_FILES} images total`);
      }
      onChange(combined);
    },
    [files, existingImageUrls.length, onChange]
  );

  const removeFile = (index: number) => {
    onChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-ink-muted">
        Images ({totalCount}/{MAX_FILES})
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
        }}
        className={clsx(
          'flex flex-col items-center justify-center gap-2 rounded-card border-2 border-dashed p-8 text-center transition-colors',
          isDragging ? 'border-amber bg-amber/5' : 'border-white/15 bg-surface'
        )}
      >
        <ImagePlus className="h-8 w-8 text-ink-faint" aria-hidden="true" />
        <p className="text-sm text-ink-muted">
          Drag images here, or{' '}
          <label className="cursor-pointer font-medium text-amber hover:underline">
            browse
            <input
              type="file"
              accept={ALLOWED_TYPES.join(',')}
              multiple
              className="sr-only"
              disabled={totalCount >= MAX_FILES}
              onChange={(e) => {
                if (e.target.files?.length) addFiles(e.target.files);
                e.target.value = ''; // allow re-selecting the same file
              }}
            />
          </label>
        </p>
        <p className="text-xs text-ink-faint">JPEG, PNG, or WEBP · up to {MAX_SIZE_MB}MB each</p>
      </div>

      {(localError || error) && (
        <p role="alert" className="text-sm text-danger">
          {localError || error}
        </p>
      )}

      {(existingImageUrls.length > 0 || files.length > 0) && (
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-4">
          {existingImageUrls.map((url) => (
            <div key={url} className="relative aspect-square overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Existing listing image" className="h-full w-full object-cover" />
            </div>
          ))}
          {files.map((file, i) => (
            <div key={`${file.name}-${i}`} className="group relative aspect-square overflow-hidden rounded-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Upload preview ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeFile(i)}
                aria-label={`Remove ${file.name}`}
                className="absolute right-1 top-1 rounded-full bg-deep/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5 text-ink-primary" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
