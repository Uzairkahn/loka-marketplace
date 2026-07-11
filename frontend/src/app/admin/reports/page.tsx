'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchReportedReviews, resolveReport } from '@/lib/admin';
import StarRating from '@/components/reviews/StarRating';
import Button from '@/components/ui/Button';

export default function AdminReportsPage() {
  const queryClient = useQueryClient();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reports'],
    queryFn: fetchReportedReviews,
  });

  const handleResolve = async (id: string, action: 'dismiss' | 'delete') => {
    setPendingId(id);
    try {
      await resolveReport(id, action);
      queryClient.invalidateQueries({ queryKey: ['admin-reports'] });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-primary">Reported reviews</h1>
      <p className="mt-1 text-ink-muted">Reviews flagged by users as fake or inappropriate.</p>

      <div className="mt-6 flex flex-col gap-4">
        {isLoading && <p className="text-ink-muted">Loading…</p>}

        {!isLoading && data?.reviews.length === 0 && (
          <p className="rounded-card border border-white/10 bg-surface p-8 text-center text-ink-muted">
            No reports pending review.
          </p>
        )}

        {data?.reviews.map((review) => (
          <div key={review._id} className="rounded-card border border-white/10 bg-surface p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-ink-muted">
                  <span className="font-medium text-ink-primary">{review.reviewer.fullName}</span> reviewed{' '}
                  <span className="font-medium text-ink-primary">{review.targetUser.fullName}</span> on &quot;
                  {review.listing.title}&quot;
                </p>
                <div className="mt-2">
                  <StarRating value={review.rating} readOnly size={16} />
                </div>
                {review.comment && <p className="mt-2 text-ink-primary">{review.comment}</p>}
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <Button
                variant="secondary"
                isLoading={pendingId === review._id}
                onClick={() => handleResolve(review._id, 'dismiss')}
              >
                Dismiss report
              </Button>
              <Button
                variant="secondary"
                isLoading={pendingId === review._id}
                onClick={() => handleResolve(review._id, 'delete')}
                className="text-danger"
              >
                Delete review
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
