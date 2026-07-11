'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap, { prefersReducedMotion, ScrollTrigger, ensureGsapRegistered } from '@/lib/gsap';
import Button from '@/components/ui/Button';
import TiltCard from '@/components/ui/TiltCard';
import { ArrowRight, MapPin } from 'lucide-react';

export default function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set('[data-hero-item]', { opacity: 1, y: 0 });
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.from('[data-hero-eyebrow]', { opacity: 0, y: 16, duration: 0.5 })
        .from(
          '[data-hero-line]',
          { opacity: 0, y: 28, duration: 0.7, stagger: 0.08 },
          '-=0.25'
        )
        .from('[data-hero-sub]', { opacity: 0, y: 16, duration: 0.6 }, '-=0.35')
        .from('[data-hero-cta]', { opacity: 0, y: 12, duration: 0.5, stagger: 0.08 }, '-=0.3')
        .from(
          '[data-hero-card]',
          { opacity: 0, y: 24, scale: 0.96, duration: 0.7, stagger: 0.1 },
          '-=0.4'
        );

      // Subtle depth cue: the ambient glow drifts slower than the page as
      // you scroll past the hero, instead of scrolling in lockstep with it.
      gsap.to('[data-hero-glow]', {
        yPercent: 40,
        ease: 'none',
        scrollTrigger: {
          trigger: rootRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative overflow-hidden px-6 pb-20 pt-16 md:pt-24">
      {/* Ambient glow, purely decorative */}
      <div
        data-hero-glow
        aria-hidden="true"
        className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-amber/10 blur-3xl"
      />

      <div className="mx-auto grid max-w-6xl gap-16 md:grid-cols-2 md:items-center">
        <div>
          <p
            data-hero-eyebrow
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-surface px-4 py-1.5 text-xs font-medium text-teal-soft"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Now live in neighborhoods across Karachi
          </p>

          <h1 className="font-display text-balance text-4xl font-semibold leading-[1.1] text-ink-primary sm:text-5xl">
            <span data-hero-line className="block">
              Your neighborhood,
            </span>
            <span data-hero-line className="block italic text-amber">
              open for business.
            </span>
          </h1>

          <p data-hero-sub className="mt-6 max-w-md text-lg text-ink-muted">
            Find trusted local services, hire skilled freelancers nearby, and buy from
            people two streets over — not a warehouse three time zones away.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/register" data-hero-cta>
              <Button variant="primary" className="text-base">
                Join your community
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/#how-it-works" data-hero-cta>
              <Button variant="secondary" className="text-base">
                See how it works
              </Button>
            </Link>
          </div>
        </div>

        {/* Preview cards standing in for real listings, clearly a product preview.
            min-h is required here: both children are position:absolute, so
            without it this wrapper collapses to 0px and the cards spill into
            whatever section follows instead of staying inside the hero. */}
        <div className="relative hidden min-h-[420px] md:block">
          <div
            data-hero-card
            className="absolute -left-4 top-4 w-64 -rotate-2"
          >
            <TiltCard className="rounded-card border border-white/10 bg-surface-raised p-5 shadow-xl">
              <p className="font-mono text-xs text-teal-soft">SERVICE · Photography</p>
              <p className="mt-2 font-display text-lg text-ink-primary">Golden-hour portrait sessions</p>
              <p className="mt-1 text-sm text-ink-muted">Bilal Studio · Saddar</p>
              <p className="mt-3 font-mono text-amber">Rs 4,500 / session</p>
            </TiltCard>
          </div>
          <div
            data-hero-card
            className="absolute left-24 top-56 w-64 rotate-2"
          >
            <TiltCard className="rounded-card border border-white/10 bg-surface-raised p-5 shadow-xl">
              <p className="font-mono text-xs text-teal-soft">PRODUCT · Home & Living</p>
              <p className="mt-2 font-display text-lg text-ink-primary">Refurbished oak dining table</p>
              <p className="mt-1 text-sm text-ink-muted">Omar Furniture Co. · North Nazimabad</p>
              <p className="mt-3 font-mono text-amber">Rs 32,000</p>
            </TiltCard>
          </div>
        </div>
      </div>
    </section>
  );
}
