'use client';

import clsx from 'clsx';
import type { ConversationSummary } from '@/types';

interface ConversationListProps {
  conversations: ConversationSummary[];
  activeUserId: string | null;
  onSelect: (userId: string, name: string) => void;
}

export default function ConversationList({ conversations, activeUserId, onSelect }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-ink-muted">
        No conversations yet. Message a seller from a listing to start one.
      </p>
    );
  }

  return (
    <div className="flex flex-col divide-y divide-white/5">
      {conversations.map((conv) => (
        <button
          key={conv.conversationId}
          onClick={() => onSelect(conv.otherUser._id, conv.otherUser.fullName)}
          className={clsx(
            'flex items-center gap-3 p-4 text-left transition-colors hover:bg-surface-raised',
            activeUserId === conv.otherUser._id && 'bg-surface-raised'
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-surface-raised font-display text-ink-primary">
            {conv.otherUser.fullName.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="truncate text-sm font-medium text-ink-primary">{conv.otherUser.fullName}</p>
              {conv.unreadCount > 0 && (
                <span className="rounded-full bg-amber px-1.5 py-0.5 font-mono text-[10px] text-deep">
                  {conv.unreadCount}
                </span>
              )}
            </div>
            <p className="truncate text-xs text-ink-muted">{conv.lastMessage.text}</p>
          </div>
        </button>
      ))}
    </div>
  );
}
