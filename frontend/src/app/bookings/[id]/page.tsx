'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import BookingCard from '@/components/bookings/BookingCard';
import ReviewForm from '@/components/reviews/ReviewForm';
import { fetchBookingById } from '@/lib/bookings';
import { fetchReviewsForListing } from '@/lib/reviews';
import { useAuth } from '@/context/AuthContext';

export default function BookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [justReviewed, setJustReviewed] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const { data: booking, isLoading } = useQuery({
    queryKey: ['booking', id],
    queryFn: () => fetchBookingById(id),
    enabled: !!user,
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', 'listing', booking?.listing._id],
    queryFn: () => fetchReviewsForListing(booking!.listing._id),
    enabled: !!booking,
  });

  if (authLoading || isLoading || !booking) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-ink-muted">Loading…</div>
      </main>
    );
  }

  const isBuyer = user?._id === booking.buyer._id;
  const alreadyReviewed = reviewsData?.reviews.some((r) => r.reviewer._id === user?._id);
  const canReview = isBuyer && booking.status === 'completed' && !alreadyReviewed && !justReviewed;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <Link href="/bookings" className="text-sm text-ink-muted hover:text-ink-primary">
          ← All bookings
        </Link>
        <h1 className="mt-2 font-display text-3xl font-semibold text-ink-primary">Booking details</h1>

        <div className="mt-6">
          <BookingCard booking={booking} />
        </div>

        {booking.notes && (
          <div className="mt-6 rounded-card border border-white/10 bg-surface p-5">
            <p className="text-sm font-medium text-ink-muted">Notes</p>
            <p className="mt-1 text-ink-primary">{booking.notes}</p>
          </div>
        )}

        {canReview && (
          <div className="mt-6">
            <ReviewForm bookingId={booking._id} onSubmitted={() => setJustReviewed(true)} />
          </div>
        )}

        {(alreadyReviewed || justReviewed) && booking.status === 'completed' && isBuyer && (
          <p className="mt-6 text-sm text-teal-soft">You've already reviewed this booking. Thank you!</p>
        )}
      </div>
      <Footer />
    </main>
  );
}
