'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQueryClient } from '@tanstack/react-query';
import type { Booking, BookingStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { updateBookingStatus } from '@/lib/bookings';
import { getApiErrorMessage } from '@/lib/api';
import BookingStatusBadge from './BookingStatusBadge';
import Button from '@/components/ui/Button';

export default function BookingCard({ booking }: { booking: Booking }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [pendingAction, setPendingAction] = useState<BookingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSeller = user?._id === booking.seller._id;
  const isBuyer = user?._id === booking.buyer._id;
  const counterparty = isSeller ? booking.buyer : booking.seller;

  const act = async (status: BookingStatus) => {
    setPendingAction(status);
    setError(null);
    try {
      await updateBookingStatus(booking._id, status);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-card border border-white/10 bg-surface p-5 sm:flex-row sm:items-center">
      <Link href={`/listings/${booking.listing._id}`} className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-raised">
        {booking.listing.images[0] && (
          <Image src={booking.listing.images[0].url} alt={booking.listing.title} fill sizes="80px" className="object-cover" />
        )}
      </Link>

      <div className="flex-1">
        <div className="flex items-center gap-3">
          <Link href={`/bookings/${booking._id}`} className="font-display text-lg text-ink-primary hover:text-amber">
            {booking.listing.title}
          </Link>
          <BookingStatusBadge status={booking.status} />
        </div>
        <p className="mt-1 text-sm text-ink-muted">
          {isSeller ? 'Requested by' : 'Provided by'} {counterparty.fullName} ·{' '}
          {new Date(booking.scheduledDate).toLocaleString()}
        </p>
        <p className="mt-1 font-mono text-sm text-amber">Rs {booking.priceAtBooking.toLocaleString()}</p>
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>

      <div className="flex flex-wrap gap-2">
        {isSeller && booking.status === 'pending' && (
          <>
            <Button variant="primary" isLoading={pendingAction === 'accepted'} onClick={() => act('accepted')}>
              Accept
            </Button>
            <Button variant="secondary" isLoading={pendingAction === 'rejected'} onClick={() => act('rejected')}>
              Reject
            </Button>
          </>
        )}
        {isBuyer && booking.status === 'pending' && (
          <Button variant="secondary" isLoading={pendingAction === 'cancelled'} onClick={() => act('cancelled')}>
            Cancel
          </Button>
        )}
        {booking.status === 'accepted' && (
          <>
            {isSeller && (
              <Button variant="primary" isLoading={pendingAction === 'completed'} onClick={() => act('completed')}>
                Mark completed
              </Button>
            )}
            <Button variant="secondary" isLoading={pendingAction === 'cancelled'} onClick={() => act('cancelled')}>
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
