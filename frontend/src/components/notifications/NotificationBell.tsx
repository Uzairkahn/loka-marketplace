'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell } from 'lucide-react';
import clsx from 'clsx';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/notifications';
import { getSocket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';
import type { AppNotification } from '@/types';

export default function NotificationBell() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
    enabled: !!user,
    // The socket delivers new notifications instantly; this poll is only a
    // backstop for missed events (e.g. a brief disconnect), so it can be slow.
    refetchInterval: 60_000,
  });

  // Real-time push: as soon as the backend creates a notification, it's
  // emitted straight into this room. We just invalidate the query so the
  // existing fetch/render path (and its "already caught up" empty state)
  // stays the single source of truth — no separate local notification list.
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleNew = (_notification: AppNotification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    };

    socket.on('new_notification', handleNew);
    return () => {
      socket.off('new_notification', handleNew);
    };
  }, [user, queryClient]);

  if (!user) return null;

  const unreadCount = data?.unreadCount ?? 0;

  const handleOpen = () => setIsOpen((o) => !o);

  const handleMarkAll = async () => {
    await markAllNotificationsRead();
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
  };

  const handleClickNotification = async (notificationId: string) => {
    await markNotificationRead(notificationId);
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        className="relative rounded-full p-2 text-ink-muted hover:bg-surface hover:text-ink-primary"
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber font-mono text-[10px] text-deep">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-80 rounded-card border border-white/10 bg-surface-raised shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 p-3">
              <p className="text-sm font-medium text-ink-primary">Notifications</p>
              {unreadCount > 0 && (
                <button onClick={handleMarkAll} className="text-xs text-teal-soft hover:underline">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {data?.notifications.length === 0 && (
                <p className="p-4 text-center text-sm text-ink-muted">You&apos;re all caught up.</p>
              )}
              {data?.notifications.map((n) => (
                <Link
                  key={n._id}
                  href={n.link || '#'}
                  onClick={() => handleClickNotification(n._id)}
                  className={clsx(
                    'block border-b border-white/5 p-3 text-sm transition-colors last:border-0 hover:bg-surface',
                    !n.isRead && 'bg-amber/5'
                  )}
                >
                  <p className="text-ink-primary">{n.message}</p>
                  <p className="mt-1 text-xs text-ink-faint">{new Date(n.createdAt).toLocaleString()}</p>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
