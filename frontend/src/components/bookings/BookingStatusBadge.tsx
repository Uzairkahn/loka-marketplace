import clsx from 'clsx';
import type { BookingStatus } from '@/types';

const STYLES: Record<BookingStatus, string> = {
  pending: 'bg-amber/10 text-amber',
  accepted: 'bg-teal/10 text-teal-soft',
  rejected: 'bg-danger/10 text-danger',
  completed: 'bg-teal/20 text-teal-soft',
  cancelled: 'bg-white/5 text-ink-faint',
};

export default function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span className={clsx('rounded-full px-3 py-1 font-mono text-xs uppercase', STYLES[status])}>
      {status}
    </span>
  );
}
