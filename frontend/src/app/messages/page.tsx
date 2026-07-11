'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import ConversationList from '@/components/chat/ConversationList';
import ChatWindow from '@/components/chat/ChatWindow';
import { fetchConversations } from '@/lib/messages';
import { useAuth } from '@/context/AuthContext';

function MessagesContent() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [active, setActive] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  // Deep-link support: /messages?with=<userId>&name=<fullName> opens straight
  // into a chat, used by the "Message" button on the listing detail page.
  useEffect(() => {
    const withId = searchParams.get('with');
    const name = searchParams.get('name');
    if (withId) setActive({ id: withId, name: name || 'Conversation' });
  }, [searchParams]);

  const { data: conversations = [] } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
    enabled: !!user,
    refetchInterval: 15_000, // light polling backstop alongside the socket's live updates
  });

  if (authLoading || !user) return null;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink-primary">Messages</h1>

        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-[280px_1fr]">
          <div className="rounded-card border border-white/10 bg-surface">
            <ConversationList
              conversations={conversations}
              activeUserId={active?.id ?? null}
              onSelect={(id, name) => setActive({ id, name })}
            />
          </div>

          <div>
            {active ? (
              <ChatWindow otherUserId={active.id} otherUserName={active.name} />
            ) : (
              <div className="flex h-[32rem] items-center justify-center rounded-card border border-white/10 bg-surface text-ink-muted">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-ink-muted">Loading…</div>}>
      <MessagesContent />
    </Suspense>
  );
}
