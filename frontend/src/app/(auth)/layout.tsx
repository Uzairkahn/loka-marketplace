import Link from 'next/link';
import AuthVisualPanel from '@/components/auth/AuthVisualPanel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative flex flex-col overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-amber/10 blur-3xl"
        />
        <header className="relative px-6 py-6">
          <Link href="/" className="font-display text-xl font-semibold text-ink-primary">
            Loka
          </Link>
        </header>
        <div className="relative flex flex-1 items-center justify-center px-6 pb-16">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>

      <AuthVisualPanel />
    </div>
  );
}
