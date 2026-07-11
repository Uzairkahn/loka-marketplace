'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ListingCard from '@/components/listings/ListingCard';
import Button from '@/components/ui/Button';
import { fetchMyListings } from '@/lib/listings';
import { useAuth } from '@/context/AuthContext';

export default function MyListingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn: fetchMyListings,
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold text-ink-primary">My listings</h1>
          <Link href="/listings/new">
            <Button variant="primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              New listing
            </Button>
          </Link>
        </div>

        {isLoading && <p className="text-ink-muted">Loading…</p>}

        {!isLoading && data?.listings.length === 0 && (
          <p className="rounded-card border border-white/10 bg-surface p-12 text-center text-ink-muted">
            You haven&apos;t created any listings yet.
          </p>
        )}

        {!isLoading && data && data.listings.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.listings.map((listing) => (
              <div key={listing._id} className="relative">
                {listing.status !== 'active' && (
                  <span className="absolute left-3 top-3 z-10 rounded-full bg-deep px-3 py-1 font-mono text-xs uppercase text-amber">
                    {listing.status}
                  </span>
                )}
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
