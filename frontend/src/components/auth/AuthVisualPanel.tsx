'use client';

import { useEffect, useRef } from 'react';
import { Sparkles, ShieldCheck, MessageCircle, Star } from 'lucide-react';
import gsap, { prefersReducedMotion } from '@/lib/gsap';

/**
 * Purely decorative — the right-hand panel on auth pages (desktop only).
 * Three "glass" cards float at different depths inside a perspective
 * scene: each bobs independently on its own idle loop, and the whole
 * group tilts together toward the cursor for a parallax layering effect.
 * No WebGL/three.js — this is CSS 3D transforms driven by GSAP, which is
 * plenty for a decorative panel and keeps the app's dependency footprint light.
 */
export default function AuthVisualPanel() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scene = sceneRef.current;
    const group = groupRef.current;
    if (!scene || !group || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Each floating card bobs on its own timeline — different duration
      // and delay per card so they drift out of sync, which reads as
      // "floating" rather than a mechanically synchronized group.
      gsap.utils.toArray<HTMLElement>('[data-float-card]').forEach((card, i) => {
        gsap.to(card, {
          y: i % 2 === 0 ? -14 : 14,
          duration: 3 + i * 0.6,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: i * 0.3,
        });
      });

      // Slow independent drift on the aurora blobs for a living background.
      gsap.utils.toArray<HTMLElement>('[data-aurora]').forEach((blob, i) => {
        gsap.to(blob, {
          x: i % 2 === 0 ? 30 : -30,
          y: i % 2 === 0 ? -20 : 20,
          duration: 8 + i * 2,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
        });
      });
    }, scene);

    // Mouse parallax: the whole card group tilts toward the cursor,
    // layered on top of each card's own independent bob.
    const rotateX = gsap.quickTo(group, 'rotateX', { duration: 0.6, ease: 'power3.out' });
    const rotateY = gsap.quickTo(group, 'rotateY', { duration: 0.6, ease: 'power3.out' });

    const handleMove = (e: MouseEvent) => {
      const rect = scene.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      rotateY((px - 0.5) * 12);
      rotateX(-(py - 0.5) * 12);
    };
    const handleLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    scene.addEventListener('mousemove', handleMove);
    scene.addEventListener('mouseleave', handleLeave);

    return () => {
      ctx.revert();
      scene.removeEventListener('mousemove', handleMove);
      scene.removeEventListener('mouseleave', handleLeave);
    };
  }, []);

  return (
    <div
      ref={sceneRef}
      className="relative hidden h-full min-h-[600px] items-center justify-center overflow-hidden bg-surface/40 lg:flex"
      style={{ perspective: '1200px' }}
    >
      {/* Aurora gradient blobs drifting slowly behind everything */}
      <div
        data-aurora
        aria-hidden="true"
        className="absolute left-1/4 top-1/4 h-72 w-72 rounded-full bg-amber/20 blur-[100px]"
      />
      <div
        data-aurora
        aria-hidden="true"
        className="absolute bottom-1/4 right-1/4 h-72 w-72 rounded-full bg-teal/20 blur-[100px]"
      />

      {/* Faint dot grid for texture/depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: 'radial-gradient(circle, #F2EFE9 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      <div
        ref={groupRef}
        className="relative [transform-style:preserve-3d]"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          data-float-card
          className="absolute -left-40 -top-24 w-56 rounded-card border border-white/15 bg-surface-raised/90 p-4 shadow-2xl backdrop-blur-md"
          style={{ transform: 'translateZ(60px) rotate(-6deg)' }}
        >
          <ShieldCheck className="h-5 w-5 text-teal-soft" aria-hidden="true" />
          <p className="mt-2 font-display text-sm text-ink-primary">Verified sellers</p>
          <p className="mt-1 text-xs text-ink-muted">Real ratings from real neighbors</p>
        </div>

        <div
          data-float-card
          className="absolute -right-48 top-8 w-56 rounded-card border border-white/15 bg-surface-raised/90 p-4 shadow-2xl backdrop-blur-md"
          style={{ transform: 'translateZ(90px) rotate(4deg)' }}
        >
          <MessageCircle className="h-5 w-5 text-amber" aria-hidden="true" />
          <p className="mt-2 font-display text-sm text-ink-primary">Chat instantly</p>
          <p className="mt-1 text-xs text-ink-muted">Message sellers in real time</p>
        </div>

        <div
          data-float-card
          className="absolute -bottom-32 left-1/2 w-56 -translate-x-1/2 rounded-card border border-white/15 bg-surface-raised/90 p-4 shadow-2xl backdrop-blur-md"
          style={{ transform: 'translateZ(40px) rotate(-3deg)' }}
        >
          <Star className="h-5 w-5 fill-amber text-amber" aria-hidden="true" />
          <p className="mt-2 font-display text-sm text-ink-primary">Community reviews</p>
          <p className="mt-1 text-xs text-ink-muted">Built on real completed bookings</p>
        </div>

        {/* Center anchor - keeps the composition grounded */}
        <div
          className="flex h-40 w-40 items-center justify-center rounded-full border border-amber/30 bg-gradient-to-br from-amber/20 to-teal/10 shadow-2xl"
          style={{ transform: 'translateZ(20px)' }}
        >
          <Sparkles className="h-10 w-10 text-amber" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
