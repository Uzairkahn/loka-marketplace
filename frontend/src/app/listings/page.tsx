'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ListingFilters from '@/components/listings/ListingFilters';
import ListingCard from '@/components/listings/ListingCard';
import Pagination from '@/components/listings/Pagination';
import Button from '@/components/ui/Button';
import { fetchListings } from '@/lib/listings';
import type { ListingFilters as ListingFiltersType } from '@/types';
import { useAuth } from '@/context/AuthContext';

function BrowseListingsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ListingFiltersType>({ page: 1, sort: 'newest' });

  // Picks up ?category=X from links like the landing page's category grid,
  // seeding the filter once on load rather than fighting the user's own
  // filter changes afterward.
  useEffect(() => {
    const category = searchParams.get('category');
    if (category) setFilters((f) => ({ ...f, category }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['listings', filters],
    queryFn: () => fetchListings(filters),
  });

  const favoritedIds = new Set(user?.favorites?.map(String) || []);

  return (
    <main>
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink-primary">
              Browse the marketplace
            </h1>
            <p className="mt-1 text-ink-muted">
              {data ? `${data.pagination.totalCount} listings found` : 'Loading listings…'}
            </p>
          </div>
          {user && (
            <Link href="/listings/new">
              <Button variant="primary">
                <Plus className="h-4 w-4" aria-hidden="true" />
                Create listing
              </Button>
            </Link>
          )}
        </div>

        <ListingFilters filters={filters} onChange={setFilters} />

        <div className="mt-8">
          {isLoading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/3] animate-pulse rounded-card bg-surface" />
              ))}
            </div>
          )}

          {isError && (
            <p className="rounded-card border border-danger/30 bg-danger/10 p-6 text-center text-danger">
              Couldn&apos;t load listings. Make sure the backend server is running.
            </p>
          )}

          {!isLoading && !isError && data?.listings.length === 0 && (
            <p className="rounded-card border border-white/10 bg-surface p-12 text-center text-ink-muted">
              No listings match your filters yet. Try broadening your search.
            </p>
          )}

          {!isLoading && !isError && data && data.listings.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.listings.map((listing) => (
                  <ListingCard
                    key={listing._id}
                    listing={listing}
                    initiallyFavorited={favoritedIds.has(listing._id)}
                  />
                ))}
              </div>
              <Pagination
                meta={data.pagination}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function BrowseListingsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-ink-muted">Loading…</div>}>
      <BrowseListingsContent />
    </Suspense>
  );
}
