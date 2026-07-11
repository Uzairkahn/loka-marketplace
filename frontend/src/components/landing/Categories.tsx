'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Wrench,
  GraduationCap,
  Code2,
  Camera,
  PenTool,
  Megaphone,
  Clapperboard,
  Sofa,
  Cpu,
  Shirt,
  Palette,
  MoreHorizontal,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react';
import gsap, { prefersReducedMotion, ensureGsapRegistered } from '@/lib/gsap';
import TiltCard from '@/components/ui/TiltCard';
import { fetchCategoryCounts } from '@/lib/listings';

const ICONS: Record<string, LucideIcon> = {
  'Graphic Designing': Palette,
  'Web Development': Code2,
  Photography: Camera,
  'Home Services': Wrench,
  Tutoring: GraduationCap,
  'Content Writing': PenTool,
  'Digital Marketing': Megaphone,
  'Video Editing': Clapperboard,
  'Furniture & Goods': Sofa,
  Electronics: Cpu,
  'Fashion & Apparel': Shirt,
  Other: MoreHorizontal,
};

// Two accent tones alternate across the grid — enough color variety to feel
// lively without breaking away from the palette into an ungoverned rainbow.
const ACCENTS = [
  { text: 'text-amber', glow: 'bg-amber/20', ring: 'group-hover:border-amber/50' },
  { text: 'text-teal-soft', glow: 'bg-teal/20', ring: 'group-hover:border-teal/50' },
];

export default function Categories() {
  const sectionRef = useRef<HTMLElement>(null);

  const { data: categories, isLoading } = useQuery({
    queryKey: ['category-counts'],
    queryFn: fetchCategoryCounts,
  });

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion() || !categories) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.from('[data-category-card]', {
        opacity: 0,
        y: 28,
        scale: 0.95,
        duration: 0.5,
        stagger: 0.06,
        ease: 'back.out(1.4)',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [categories]);

  return (
    <section ref={sectionRef} id="categories" className="mx-auto max-w-6xl px-6 py-20">
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-semibold text-ink-primary">
            Browse by category
          </h2>
          <p className="mt-2 text-ink-muted">Live listing counts across the platform.</p>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-card bg-surface" />
          ))}
        </div>
      )}

      {categories && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((cat, i) => {
            const Icon = ICONS[cat.name] || MoreHorizontal;
            const accent = ACCENTS[i % ACCENTS.length]!;
            return (
              <div key={cat.name} data-category-card>
                <TiltCard maxTilt={6}>
                  <Link
                    href={`/listings?category=${encodeURIComponent(cat.name)}`}
                    className={`group relative block overflow-hidden rounded-card border border-white/10 bg-surface-raised p-5 transition-colors ${accent.ring}`}
                  >
                    {/* Ambient glow blob behind the icon, blooms on hover */}
                    <div
                      aria-hidden="true"
                      className={`absolute -right-6 -top-6 h-24 w-24 rounded-full ${accent.glow} blur-2xl transition-transform duration-500 group-hover:scale-150`}
                    />

                    <div className="relative">
                      <Icon className={`h-6 w-6 ${accent.text}`} aria-hidden="true" />
                      <p className="mt-4 font-display text-lg leading-tight text-ink-primary">
                        {cat.name}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="font-mono text-xs text-ink-muted">
                          {cat.count > 0 ? `${cat.count} listing${cat.count === 1 ? '' : 's'}` : 'Be the first'}
                        </p>
                        <ArrowUpRight
                          className={`h-4 w-4 -translate-x-1 translate-y-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:translate-y-0 group-hover:opacity-100 ${accent.text}`}
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                  </Link>
                </TiltCard>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
