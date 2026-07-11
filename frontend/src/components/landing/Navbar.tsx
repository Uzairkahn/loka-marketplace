'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import NotificationBell from '@/components/notifications/NotificationBell';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const { user, isLoading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-deep/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-ink-primary">
          Loka
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          <Link href="/listings" className="text-sm text-ink-muted transition-colors hover:text-ink-primary">
            Browse
          </Link>
          <Link href="/#how-it-works" className="text-sm text-ink-muted transition-colors hover:text-ink-primary">
            How it works
          </Link>
          <Link href="/#categories" className="text-sm text-ink-muted transition-colors hover:text-ink-primary">
            Categories
          </Link>
          {!isLoading && user && (
            <>
              <Link href="/messages" className="text-sm text-ink-muted transition-colors hover:text-ink-primary">
                Messages
              </Link>
              <Link href="/bookings" className="text-sm text-ink-muted transition-colors hover:text-ink-primary">
                Bookings
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!isLoading && !user && (
            <>
              <Link href="/login">
                <Button variant="ghost">Log in</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Get started</Button>
              </Link>
            </>
          )}
          {!isLoading && user && (
            <>
              <NotificationBell />
              <Link href="/dashboard">
                <Button variant="primary">Go to dashboard</Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
