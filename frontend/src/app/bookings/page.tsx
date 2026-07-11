'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookingCard from '@/components/bookings/BookingCard';
import { fetchMyBookings } from '@/lib/bookings';
import { useAuth } from '@/context/AuthContext';
import type { BookingStatus } from '@/types';

const STATUS_FILTERS: { label: string; value: BookingStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Accepted', value: 'accepted' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function BookingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [status, setStatus] = useState<BookingStatus | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['bookings', role, status],
    queryFn: () => fetchMyBookings({ role, status }),
    enabled: !!user,
  });

  if (authLoading || !user) return null;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink-primary">Bookings</h1>

        <div className="mt-6 flex gap-2 border-b border-white/10">
          {(['buyer', 'seller'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={clsx(
                'px-4 py-2 text-sm font-medium capitalize transition-colors',
                role === r ? 'border-b-2 border-amber text-amber' : 'text-ink-muted'
              )}
            >
              As {r}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setStatus(f.value)}
              className={clsx(
                'rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
                status === f.value ? 'bg-amber text-deep' : 'bg-surface text-ink-muted'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-4">
          {isLoading && <p className="text-ink-muted">Loading…</p>}
          {!isLoading && data?.bookings.length === 0 && (
            <p className="rounded-card border border-white/10 bg-surface p-12 text-center text-ink-muted">
              No bookings {role === 'buyer' ? 'made' : 'received'} yet.
            </p>
          )}
          {data?.bookings.map((booking) => (
            <BookingCard key={booking._id} booking={booking} />
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
