'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Sparkles, Wrench } from 'lucide-react';
import gsap, { prefersReducedMotion } from '@/lib/gsap';
import { fetchListings } from '@/lib/listings';
import { formatRelativeTime } from '@/lib/relativeTime';

/**
 * A noticeboard-style marquee — the page's signature element. Pulls the
 * most recently published listings from the real API (no fabricated
 * activity) and scrolls them as one continuous GSAP timeline, looping
 * seamlessly via the classic "duplicate the list + translate -50%" trick.
 */
export default function MarketPulse() {
  const trackRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);

  const { data } = useQuery({
    queryKey: ['listings', 'market-pulse'],
    queryFn: () => fetchListings({ sort: 'newest', page: 1 }),
  });

  const feed = data?.listings.slice(0, 8) ?? [];

  useEffect(() => {
    if (!trackRef.current || prefersReducedMotion() || feed.length === 0) return;

    const track = trackRef.current;
    const distance = track.scrollWidth / 2;

    tweenRef.current = gsap.to(track, {
      x: -distance,
      duration: distance / 40, // constant speed regardless of content length
      ease: 'none',
      repeat: -1,
    });

    return () => {
      tweenRef.current?.kill();
    };
    // Re-run once real data arrives, since scrollWidth is 0 until content renders.
  }, [feed.length]);

  const pause = () => tweenRef.current?.pause();
  const resume = () => tweenRef.current?.resume();

  if (feed.length === 0) {
    return (
      <div className="border-y border-white/10 bg-surface/60 py-4 text-center">
        <p className="text-sm text-ink-muted">
          <Sparkles className="mr-2 inline h-4 w-4 text-amber" aria-hidden="true" />
          Your community&apos;s activity will show up here as listings go live.
        </p>
      </div>
    );
  }

  const doubledFeed = [...feed, ...feed];

  return (
    <div
      className="relative overflow-hidden border-y border-white/10 bg-surface/60 py-4"
      onMouseEnter={pause}
      onMouseLeave={resume}
      role="marquee"
      aria-label="Recently listed on Loka"
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-deep to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-deep to-transparent" />
      <div ref={trackRef} className="flex w-max gap-8 px-4">
        {doubledFeed.map((listing, i) => (
          <Link
            key={`${listing._id}-${i}`}
            href={`/listings/${listing._id}`}
            className="flex items-center gap-3 whitespace-nowrap rounded-full border border-white/10 bg-surface-raised px-5 py-2.5 transition-colors hover:border-amber/40"
          >
            <Wrench className="h-4 w-4 shrink-0 text-amber" aria-hidden="true" />
            <span className="text-sm text-ink-primary">
              <span className="font-semibold">{listing.owner.fullName}</span>{' '}
              <span className="text-ink-muted">
                listed &quot;{listing.title}&quot;
              </span>
            </span>
            <span className="font-mono text-xs text-ink-faint">
              {listing.location.city || 'Location not set'} · {formatRelativeTime(listing.createdAt)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
