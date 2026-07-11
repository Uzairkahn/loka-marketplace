'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PaginationMeta } from '@/types';
import Button from '@/components/ui/Button';

interface PaginationProps {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
}

export default function Pagination({ meta, onPageChange }: PaginationProps) {
  if (meta.totalPages <= 1) return null;

  return (
    <div className="mt-10 flex items-center justify-center gap-4">
      <Button
        variant="secondary"
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
        Prev
      </Button>
      <span className="font-mono text-sm text-ink-muted">
        Page {meta.page} of {meta.totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={!meta.hasNextPage}
        onClick={() => onPageChange(meta.page + 1)}
        aria-label="Next page"
      >
        Next
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
