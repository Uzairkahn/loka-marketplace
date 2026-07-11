'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, X } from 'lucide-react';
import { fetchAdminListings, setListingStatus } from '@/lib/admin';
import Button from '@/components/ui/Button';
import Pagination from '@/components/listings/Pagination';

export default function AdminListingsPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pendingId, setPendingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', status, page],
    queryFn: () => fetchAdminListings({ status, page }),
  });

  const handleStatusChange = async (id: string, next: 'active' | 'removed') => {
    setPendingId(id);
    try {
      await setListingStatus(id, next);
      queryClient.invalidateQueries({ queryKey: ['admin-listings'] });
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-primary">Listings</h1>

      <div className="mt-6 flex gap-2">
        {[
          { label: 'All', value: undefined },
          { label: 'Pending', value: 'pending' },
          { label: 'Active', value: 'active' },
          { label: 'Removed', value: 'removed' },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => {
              setStatus(f.value);
              setPage(1);
            }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              status === f.value ? 'bg-amber text-deep' : 'bg-surface text-ink-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3">
        {isLoading && <p className="text-ink-muted">Loading…</p>}
        {data?.listings.map((listing) => (
          <div key={listing._id} className="flex items-center justify-between gap-4 rounded-card border border-white/10 bg-surface p-4">
            <div className="min-w-0">
              <Link href={`/listings/${listing._id}`} className="truncate font-medium text-ink-primary hover:text-amber">
                {listing.title}
              </Link>
              <p className="text-xs text-ink-muted">
                {listing.owner.fullName} · {listing.category} · Rs {listing.price.toLocaleString()}
              </p>
              <span className="mt-1 inline-block rounded-full bg-surface-raised px-2 py-0.5 font-mono text-[10px] uppercase text-ink-faint">
                {listing.status}
              </span>
            </div>
            <div className="flex shrink-0 gap-2">
              {listing.status !== 'active' && (
                <Button
                  variant="primary"
                  isLoading={pendingId === listing._id}
                  onClick={() => handleStatusChange(listing._id, 'active')}
                >
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                </Button>
              )}
              {listing.status !== 'removed' && (
                <Button
                  variant="secondary"
                  isLoading={pendingId === listing._id}
                  onClick={() => handleStatusChange(listing._id, 'removed')}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" /> Remove
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {data && <Pagination meta={data.pagination} onPageChange={setPage} />}
    </div>
  );
}
