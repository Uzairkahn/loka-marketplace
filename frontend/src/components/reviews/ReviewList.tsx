'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flag } from 'lucide-react';
import StarRating from './StarRating';
import { fetchReviewsForListing, flagReview } from '@/lib/reviews';
import { useAuth } from '@/context/AuthContext';

export default function ReviewList({ listingId }: { listingId: string }) {
  const { user } = useAuth();
  const [flaggedIds, setFlaggedIds] = useState<Set<string>>(new Set());

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', 'listing', listingId],
    queryFn: () => fetchReviewsForListing(listingId),
  });

  const handleFlag = async (reviewId: string) => {
    if (!user || flaggedIds.has(reviewId)) return;
    try {
      await flagReview(reviewId);
      setFlaggedIds((prev) => new Set(prev).add(reviewId));
    } catch {
      // Silent — flagging failure isn't critical enough to interrupt the reader.
    }
  };

  return (
    <div className="mt-12">
      <h2 className="font-display text-2xl font-semibold text-ink-primary">
        Reviews {data ? `(${data.pagination.totalCount})` : ''}
      </h2>

      {isLoading && <p className="mt-4 text-ink-muted">Loading reviews…</p>}

      {!isLoading && data?.reviews.length === 0 && (
        <p className="mt-4 text-ink-muted">No reviews yet — be the first to book and review.</p>
      )}

      <div className="mt-4 flex flex-col gap-4">
        {data?.reviews.map((review) => (
          <div key={review._id} className="rounded-card border border-white/10 bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-raised font-display text-sm text-ink-primary">
                  {review.reviewer.fullName.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-primary">{review.reviewer.fullName}</p>
                  <StarRating value={review.rating} readOnly size={14} />
                </div>
              </div>

              {user && (
                <button
                  onClick={() => handleFlag(review._id)}
                  disabled={flaggedIds.has(review._id)}
                  aria-label="Report this review"
                  className="text-ink-faint hover:text-danger disabled:text-danger/50"
                >
                  <Flag className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
            {review.comment && <p className="mt-3 text-ink-muted">{review.comment}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
