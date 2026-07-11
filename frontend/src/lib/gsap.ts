'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

let registered = false;

/**
 * Registers GSAP plugins exactly once across the app. Call from a
 * component's useEffect/useGSAP before building a timeline or using
 * ScrollTrigger. Guarded so repeated calls (many components use this) don't
 * re-register and so it never runs during SSR, where `window` doesn't exist.
 */
export const ensureGsapRegistered = () => {
  if (registered || typeof window === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
};

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export { ScrollTrigger };
export default gsap;
