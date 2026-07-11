'use client';

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-deep px-6">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface/80 px-8 py-10 text-center shadow-2xl shadow-black/20 backdrop-blur">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber/30 border-t-amber" />
          <div className="absolute inset-3 rounded-full bg-amber/20" />
        </div>
        <div>
          <p className="font-display text-lg font-semibold text-ink-primary">Page is loading</p>
          <p className="mt-1 text-sm text-ink-muted">Getting things ready for you…</p>
        </div>
      </div>
    </div>
  );
}
