'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ListingCard from '@/components/listings/ListingCard';
import { fetchFavorites } from '@/lib/listings';
import { useAuth } from '@/context/AuthContext';

export default function FavoritesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink-primary">Saved listings</h1>
        <p className="mt-1 text-ink-muted">Things you&apos;ve favorited across the marketplace.</p>

        {isLoading && <p className="mt-8 text-ink-muted">Loading…</p>}

        {!isLoading && data?.listings.length === 0 && (
          <p className="mt-8 rounded-card border border-white/10 bg-surface p-12 text-center text-ink-muted">
            No saved listings yet. Tap the heart on any listing to save it here.
          </p>
        )}

        {!isLoading && data && data.listings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} initiallyFavorited />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
