'use client';

import { useEffect, useRef } from 'react';
import gsap, { prefersReducedMotion } from '@/lib/gsap';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  /** Maximum rotation in degrees. Keep small (6-10) — this reads as "premium
   * product photography" at low angles and as a gimmick past ~15deg. */
  maxTilt?: number;
}

export default function TiltCard({ children, className = '', maxTilt = 8 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const glare = glareRef.current;
    if (!card || !glare) return;

    // Touch devices have no hover/pointer precision to drive a tilt, and
    // reduced-motion users have opted out of exactly this kind of effect —
    // both get the plain card with no listeners attached at all.
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (isCoarsePointer || prefersReducedMotion()) return;

    // quickTo builds a reusable, GPU-friendly tween per property — far
    // cheaper than calling gsap.to() on every mousemove event, which is
    // exactly how often this fires.
    const rotateX = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3.out' });
    const rotateY = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3.out' });
    const translateZ = gsap.quickTo(card, 'z', { duration: 0.5, ease: 'power3.out' });
    const glareX = gsap.quickTo(glare, 'xPercent', { duration: 0.5, ease: 'power3.out' });
    const glareY = gsap.quickTo(glare, 'yPercent', { duration: 0.5, ease: 'power3.out' });
    const glareOpacity = gsap.quickTo(glare, 'opacity', { duration: 0.3 });

    const handleMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width; // 0 to 1 across the card
      const py = (e.clientY - rect.top) / rect.height;

      rotateY(( px - 0.5) * maxTilt * 2);
      rotateX(-(py - 0.5) * maxTilt * 2);
      translateZ(20);
      glareX(px * 100 - 50);
      glareY(py * 100 - 50);
      glareOpacity(0.15);
    };

    const handleLeave = () => {
      rotateX(0);
      rotateY(0);
      translateZ(0);
      glareOpacity(0);
    };

    card.addEventListener('mousemove', handleMove);
    card.addEventListener('mouseleave', handleLeave);
    return () => {
      card.removeEventListener('mousemove', handleMove);
      card.removeEventListener('mouseleave', handleLeave);
    };
  }, [maxTilt]);

  return (
    <div style={{ perspective: '1000px' }}>
      <div
        ref={cardRef}
        className={`relative [transform-style:preserve-3d] will-change-transform ${className}`}
      >
        {children}
        <div
          ref={glareRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
          style={{
            background:
              'radial-gradient(circle at center, rgba(242,239,233,0.8) 0%, transparent 60%)',
          }}
        />
      </div>
    </div>
  );
}
