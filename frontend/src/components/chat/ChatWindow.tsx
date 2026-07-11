'use client';

import { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getSocket } from '@/lib/socket';
import { fetchMessagesWithUser } from '@/lib/messages';
import { useAuth } from '@/context/AuthContext';
import type { ChatMessage } from '@/types';
import Button from '@/components/ui/Button';

interface ChatWindowProps {
  otherUserId: string;
  otherUserName: string;
}

export default function ChatWindow({ otherUserId, otherUserName }: ChatWindowProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: history, isLoading } = useQuery({
    queryKey: ['messages', otherUserId],
    queryFn: () => fetchMessagesWithUser(otherUserId),
  });

  // Seed local state from REST history, then let the socket append new ones live.
  useEffect(() => {
    if (history) setMessages(history.messages);
  }, [history]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleReceive = (message: ChatMessage) => {
      const belongsToThisThread =
        (message.sender === otherUserId && message.recipient === user._id) ||
        (message.sender === user._id && message.recipient === otherUserId);
      if (!belongsToThisThread) return;

      setMessages((prev) => [...prev, message]);
      if (message.sender === otherUserId) {
        socket.emit('mark_read', { conversationId: message.conversationId });
      }
      // Keep the conversation list's last-message/unread preview in sync.
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    };

    const handleTyping = ({ senderId, isTyping }: { senderId: string; isTyping: boolean }) => {
      if (senderId === otherUserId) setIsOtherTyping(isTyping);
    };

    socket.on('receive_message', handleReceive);
    socket.on('typing', handleTyping);

    // Mark any already-received unread messages from this user as read on open.
    if (history?.conversationId) {
      socket.emit('mark_read', { conversationId: history.conversationId });
    }

    return () => {
      socket.off('receive_message', handleReceive);
      socket.off('typing', handleTyping);
    };
  }, [otherUserId, user, history?.conversationId, queryClient]);

  const handleSend = () => {
    const socket = getSocket();
    const text = draft.trim();
    if (!text || !socket) return;

    setSendError(null);
    socket.emit(
      'send_message',
      { recipientId: otherUserId, text },
      (ack: { success: boolean; message?: string }) => {
        if (!ack.success) setSendError(ack.message || 'Message failed to send');
      }
    );
    setDraft('');
    socket.emit('typing', { recipientId: otherUserId, isTyping: false });
  };

  const handleDraftChange = (value: string) => {
    setDraft(value);
    const socket = getSocket();
    if (!socket) return;

    socket.emit('typing', { recipientId: otherUserId, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('typing', { recipientId: otherUserId, isTyping: false });
    }, 1500);
  };

  return (
    <div className="flex h-[32rem] flex-col rounded-card border border-white/10 bg-surface">
      <div className="border-b border-white/10 p-4">
        <p className="font-display text-lg text-ink-primary">{otherUserName}</p>
        {isOtherTyping && <p className="text-xs text-teal-soft">typing…</p>}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
        {isLoading && <p className="text-center text-sm text-ink-muted">Loading conversation…</p>}
        {!isLoading && messages.length === 0 && (
          <p className="text-center text-sm text-ink-muted">Say hello 👋</p>
        )}
        <div className="flex flex-col gap-2">
          {messages.map((msg) => {
            const isMine = msg.sender === user?._id;
            return (
              <div
                key={msg._id}
                className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                  isMine
                    ? 'self-end bg-amber text-deep'
                    : 'self-start bg-surface-raised text-ink-primary'
                }`}
              >
                {msg.text}
              </div>
            );
          })}
        </div>
      </div>

      {sendError && <p className="px-4 text-xs text-danger">{sendError}</p>}

      <div className="flex items-center gap-2 border-t border-white/10 p-3">
        <input
          value={draft}
          onChange={(e) => handleDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message…"
          aria-label="Message"
          className="flex-1 rounded-full border border-white/10 bg-surface-raised px-4 py-2 text-sm text-ink-primary placeholder:text-ink-faint focus:border-amber focus:outline-none"
        />
        <Button variant="primary" onClick={handleSend} aria-label="Send message">
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
