'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Wallet, ListChecks, Clock, Bookmark, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import BookingStatusBadge from '@/components/bookings/BookingStatusBadge';
import { fetchDashboardSummary } from '@/lib/dashboard';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) router.replace('/login');
  }, [isLoading, user, router]);

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary,
    enabled: !!user,
  });

  if (isLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center text-ink-muted">
        Loading your dashboard…
      </div>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-ink-primary">
              Welcome, {user.fullName.split(' ')[0]}
            </h1>
            <p className="mt-1 text-ink-muted">Here&apos;s what&apos;s happening across your account.</p>
          </div>
          {user.role === 'admin' && (
            <Link href="/admin">
              <Button variant="secondary">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Admin panel
              </Button>
            </Link>
          )}
        </div>

        {summaryLoading && <p className="mt-8 text-ink-muted">Loading your stats…</p>}

        {summary && (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StatCard label="Earnings (completed)" value={`Rs ${summary.earnings.toLocaleString()}`} icon={Wallet} />
              <StatCard label="Active listings" value={summary.activeListingsCount} icon={ListChecks} accent="teal" />
              <StatCard label="Pending requests" value={summary.pendingBookingsAsSeller} icon={Clock} />
              <StatCard label="Saved listings" value={summary.favoritesCount} icon={Bookmark} accent="teal" />
            </div>

            <div className="mt-10">
              <h2 className="font-display text-xl text-ink-primary">Recent activity</h2>
              {summary.recentBookings.length === 0 ? (
                <p className="mt-3 text-ink-muted">No booking activity yet.</p>
              ) : (
                <div className="mt-3 flex flex-col gap-3">
                  {summary.recentBookings.map((b) => (
                    <Link
                      key={b._id}
                      href={`/bookings/${b._id}`}
                      className="flex items-center justify-between rounded-card border border-white/10 bg-surface p-4 hover:border-amber/40"
                    >
                      <div>
                        <p className="text-sm font-medium text-ink-primary">{b.listing.title}</p>
                        <p className="text-xs text-ink-muted">
                          {b.buyer.fullName} → {b.seller.fullName}
                        </p>
                      </div>
                      <BookingStatusBadge status={b.status} />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        <div className="mt-10 grid gap-4 sm:grid-cols-4">
          <Link href="/listings/new" className="rounded-card border border-white/10 bg-surface p-5 hover:border-amber/40">
            <p className="font-display text-lg text-ink-primary">Create a listing</p>
            <p className="mt-1 text-sm text-ink-muted">List a product or service</p>
          </Link>
          <Link href="/my-listings" className="rounded-card border border-white/10 bg-surface p-5 hover:border-amber/40">
            <p className="font-display text-lg text-ink-primary">My listings</p>
            <p className="mt-1 text-sm text-ink-muted">Manage what you've posted</p>
          </Link>
          <Link href="/bookings" className="rounded-card border border-white/10 bg-surface p-5 hover:border-amber/40">
            <p className="font-display text-lg text-ink-primary">Bookings</p>
            <p className="mt-1 text-sm text-ink-muted">As buyer and as seller</p>
          </Link>
          <Link href="/favorites" className="rounded-card border border-white/10 bg-surface p-5 hover:border-amber/40">
            <p className="font-display text-lg text-ink-primary">Saved</p>
            <p className="mt-1 text-sm text-ink-muted">Listings you've favorited</p>
          </Link>
        </div>

        <Button
          variant="secondary"
          className="mt-10"
          onClick={async () => {
            await logout();
            router.push('/');
          }}
        >
          Log out
        </Button>
      </div>
      <Footer />
    </main>
  );
}
