'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, MapPin, Star } from 'lucide-react';
import clsx from 'clsx';
import type { Listing } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { toggleFavorite } from '@/lib/listings';
import TiltCard from '@/components/ui/TiltCard';
import { useState } from 'react';

interface ListingCardProps {
  listing: Listing;
  initiallyFavorited?: boolean;
}

export default function ListingCard({ listing, initiallyFavorited = false }: ListingCardProps) {
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(initiallyFavorited);
  const [count, setCount] = useState(listing.favoritesCount);
  const [pending, setPending] = useState(false);

  const handleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || pending) return;
    setPending(true);
    const prevFavorited = isFavorited;
    const prevCount = count;
    // Optimistic update, rolled back on failure — keeps the interaction snappy.
    setIsFavorited(!prevFavorited);
    setCount(prevFavorited ? prevCount - 1 : prevCount + 1);
    try {
      const result = await toggleFavorite(listing._id);
      setIsFavorited(result.isFavorited);
      setCount(result.favoritesCount);
    } catch {
      setIsFavorited(prevFavorited);
      setCount(prevCount);
    } finally {
      setPending(false);
    }
  };

  const coverImage = listing.images[0]?.url;

  return (
    <TiltCard
      maxTilt={7}
      className="overflow-hidden rounded-card border border-white/10 bg-surface transition-colors hover:border-amber/40"
    >
      <Link href={`/listings/${listing._id}`} className="group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-raised">
        {coverImage ? (
          <Image
            src={coverImage}
            alt={listing.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-faint">No image</div>
        )}

        <span className="absolute left-3 top-3 rounded-full bg-deep/80 px-3 py-1 font-mono text-xs text-teal-soft backdrop-blur">
          {listing.type === 'service' ? 'SERVICE' : 'PRODUCT'}
        </span>

        {user && (
          <button
            onClick={handleFavorite}
            aria-label={isFavorited ? 'Remove from favorites' : 'Save to favorites'}
            aria-pressed={isFavorited}
            className="absolute right-3 top-3 rounded-full bg-deep/80 p-2 backdrop-blur transition-transform active:scale-90"
          >
            <Heart
              className={clsx('h-4 w-4', isFavorited ? 'fill-amber text-amber' : 'text-ink-primary')}
              aria-hidden="true"
            />
          </button>
        )}
      </div>

      <div className="p-4">
        <p className="truncate font-mono text-xs text-ink-faint">{listing.category}</p>
        <h3 className="mt-1 truncate font-display text-lg text-ink-primary">{listing.title}</h3>

        <div className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="truncate">
            {listing.location.city || 'Location not set'}
            {listing.location.country ? `, ${listing.location.country}` : ''}
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="font-mono text-amber">Rs {listing.price.toLocaleString()}</span>
          {listing.ratingCount > 0 && (
            <span className="flex items-center gap-1 text-sm text-ink-muted">
              <Star className="h-3.5 w-3.5 fill-amber text-amber" aria-hidden="true" />
              {listing.ratingAverage.toFixed(1)}
            </span>
          )}
        </div>

        {count > 0 && <p className="mt-1 text-xs text-ink-faint">{count} saved this</p>}
      </div>
      </Link>
    </TiltCard>
  );
}
