import { api } from './api';
import type { ChatMessage, ConversationSummary } from '@/types';

export const fetchConversations = async (): Promise<ConversationSummary[]> => {
  const { data } = await api.get<{ success: true; conversations: ConversationSummary[] }>(
    '/messages/conversations'
  );
  return data.conversations;
};

export const fetchMessagesWithUser = async (
  userId: string
): Promise<{ conversationId: string; messages: ChatMessage[] }> => {
  const { data } = await api.get<{
    success: true;
    conversationId: string;
    messages: ChatMessage[];
  }>(`/messages/with/${userId}`);
  return data;
};
