'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import clsx from 'clsx';

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  size?: number;
}

export default function StarRating({ value, onChange, readOnly = false, size = 20 }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const displayValue = hovered ?? value;

  return (
    <div className="flex items-center gap-1" role={readOnly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          aria-pressed={value === star}
          onMouseEnter={() => !readOnly && setHovered(star)}
          onMouseLeave={() => !readOnly && setHovered(null)}
          onClick={() => onChange?.(star)}
          className={clsx(!readOnly && 'cursor-pointer', readOnly && 'cursor-default')}
        >
          <Star
            width={size}
            height={size}
            className={star <= displayValue ? 'fill-amber text-amber' : 'text-ink-faint'}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}
