'use client';

import { useQuery } from '@tanstack/react-query';
import { Users, ListChecks, CalendarCheck, Flag, TrendingUp, ShieldAlert } from 'lucide-react';
import StatCard from '@/components/ui/StatCard';
import { fetchPlatformStats } from '@/lib/admin';

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchPlatformStats,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink-primary">Platform overview</h1>
      <p className="mt-1 text-ink-muted">Real-time stats across all users, listings, and bookings.</p>

      {isLoading && <p className="mt-8 text-ink-muted">Loading…</p>}

      {stats && (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <StatCard label="Total users" value={stats.totalUsers} icon={Users} />
          <StatCard label="Suspended users" value={stats.suspendedUsers} icon={ShieldAlert} accent="teal" />
          <StatCard label="Total listings" value={stats.totalListings} icon={ListChecks} />
          <StatCard label="Pending approval" value={stats.pendingListings} icon={ListChecks} accent="teal" />
          <StatCard label="Total bookings" value={stats.totalBookings} icon={CalendarCheck} />
          <StatCard label="Completed bookings" value={stats.completedBookings} icon={CalendarCheck} accent="teal" />
          <StatCard label="Flagged reviews" value={stats.flaggedReviewsCount} icon={Flag} />
          <StatCard label="Platform GMV" value={`Rs ${stats.platformGMV.toLocaleString()}`} icon={TrendingUp} accent="teal" />
        </div>
      )}
    </div>
  );
}
