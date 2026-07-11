'use client';

import { useEffect, useRef } from 'react';
import gsap, { prefersReducedMotion, ensureGsapRegistered } from '@/lib/gsap';

const steps = [
  {
    step: '01',
    title: 'Post or browse',
    detail: 'List a service or product in minutes, or search what your neighbors are already offering.',
  },
  {
    step: '02',
    title: 'Book with confidence',
    detail: 'Message the seller directly, agree on a time, and track the booking status end to end.',
  },
  {
    step: '03',
    title: 'Rate the experience',
    detail: 'Leave a review after completion — reputations here are built by real neighbors, not star-farming.',
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current || prefersReducedMotion()) return;
    ensureGsapRegistered();

    const ctx = gsap.context(() => {
      gsap.from('[data-step]', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="how-it-works" className="border-t border-white/5 bg-surface/40 px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <h2 className="font-display text-3xl font-semibold text-ink-primary">How it works</h2>
        <div className="mt-10 grid gap-8 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.step} data-step>
              <span className="font-mono text-sm text-amber">{s.step}</span>
              <h3 className="mt-3 font-display text-xl text-ink-primary">{s.title}</h3>
              <p className="mt-2 text-ink-muted">{s.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
