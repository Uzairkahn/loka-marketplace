'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Heart, MapPin, Star, Pencil, Trash2, Clock } from 'lucide-react';
import clsx from 'clsx';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Button from '@/components/ui/Button';
import BookingRequestModal from '@/components/bookings/BookingRequestModal';
import ReviewList from '@/components/reviews/ReviewList';
import { fetchListingById, toggleFavorite, deleteListing } from '@/lib/listings';
import { useAuth } from '@/context/AuthContext';
import { getApiErrorMessage } from '@/lib/api';

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeImage, setActiveImage] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id),
  });

  const isOwner = user && listing && user._id === listing.owner._id;
  const isFavorited = user?.favorites?.includes(id) ?? false;

  const handleFavorite = async () => {
    if (!user) return router.push('/login');
    try {
      await toggleFavorite(id);
      queryClient.invalidateQueries({ queryKey: ['listing', id] });
    } catch (err) {
      setActionError(getApiErrorMessage(err));
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this listing? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await deleteListing(id);
      router.push('/listings');
    } catch (err) {
      setActionError(getApiErrorMessage(err));
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center text-ink-muted">Loading…</div>
      </main>
    );
  }

  if (isError || !listing) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-ink-muted">This listing couldn&apos;t be found.</p>
          <Link href="/listings" className="mt-4 inline-block text-amber hover:underline">
            Back to browse
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-white/10 bg-surface">
              {listing.images[activeImage] && (
                <Image
                  src={listing.images[activeImage].url}
                  alt={listing.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  priority
                />
              )}
            </div>
            {listing.images.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {listing.images.map((img, i) => (
                  <button
                    key={img.publicId}
                    onClick={() => setActiveImage(i)}
                    className={clsx(
                      'relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2',
                      activeImage === i ? 'border-amber' : 'border-white/10'
                    )}
                  >
                    <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div>
            <span className="rounded-full bg-surface-raised px-3 py-1 font-mono text-xs text-teal-soft">
              {listing.type === 'service' ? 'SERVICE' : 'PRODUCT'} · {listing.category}
            </span>

            <div className="mt-4 flex items-start justify-between gap-4">
              <h1 className="font-display text-3xl font-semibold text-ink-primary">{listing.title}</h1>
              <button
                onClick={handleFavorite}
                aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
                aria-pressed={isFavorited}
                className="shrink-0 rounded-full border border-white/10 bg-surface p-3"
              >
                <Heart className={clsx('h-5 w-5', isFavorited ? 'fill-amber text-amber' : 'text-ink-muted')} aria-hidden="true" />
              </button>
            </div>

            <p className="mt-2 flex items-center gap-1.5 text-ink-muted">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {listing.location.city || 'Location not set'}
              {listing.location.country ? `, ${listing.location.country}` : ''}
            </p>

            <p className="mt-4 font-mono text-2xl text-amber">Rs {listing.price.toLocaleString()}</p>

            {listing.deliveryTime && (
              <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
                <Clock className="h-4 w-4" aria-hidden="true" />
                Estimated delivery: {listing.deliveryTime}
              </p>
            )}

            <p className="mt-6 whitespace-pre-line leading-relaxed text-ink-primary">
              {listing.description}
            </p>

            {actionError && (
              <p role="alert" className="mt-4 rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
                {actionError}
              </p>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {!isOwner && (
                <Button
                  variant="primary"
                  onClick={() => (user ? setIsBookingModalOpen(true) : router.push('/login'))}
                >
                  Request booking
                </Button>
              )}
              {isOwner && (
                <>
                  <Link href={`/listings/${listing._id}/edit`}>
                    <Button variant="secondary">
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                      Edit
                    </Button>
                  </Link>
                  <Button variant="secondary" isLoading={isDeleting} onClick={handleDelete}>
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                    Delete
                  </Button>
                </>
              )}
            </div>

            {/* Seller card */}
            <div className="mt-10 flex items-center gap-4 rounded-card border border-white/10 bg-surface p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-raised font-display text-lg text-ink-primary">
                {listing.owner.fullName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-medium text-ink-primary">{listing.owner.fullName}</p>
                {listing.owner.ratingCount ? (
                  <p className="flex items-center gap-1 text-sm text-ink-muted">
                    <Star className="h-3.5 w-3.5 fill-amber text-amber" aria-hidden="true" />
                    {listing.owner.ratingAverage.toFixed(1)} ({listing.owner.ratingCount} reviews)
                  </p>
                ) : (
                  <p className="text-sm text-ink-faint">No reviews yet</p>
                )}
              </div>
              {!isOwner && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    if (!user) return router.push('/login');
                    router.push(
                      `/messages?with=${listing.owner._id}&name=${encodeURIComponent(listing.owner.fullName)}`
                    );
                  }}
                >
                  Message
                </Button>
              )}
            </div>
          </div>
        </div>

        <ReviewList listingId={listing._id} />
      </div>

      <BookingRequestModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        listingId={listing._id}
        listingTitle={listing.title}
      />

      <Footer />
    </main>
  );
}
