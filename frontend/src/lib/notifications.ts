import { api } from './api';
import type { AppNotification, PaginationMeta } from '@/types';

interface NotificationsResponse {
  success: true;
  notifications: AppNotification[];
  unreadCount: number;
  pagination: PaginationMeta;
}

export const fetchNotifications = async (): Promise<NotificationsResponse> => {
  const { data } = await api.get<NotificationsResponse>('/notifications');
  return data;
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await api.patch(`/notifications/${id}/read`);
};

export const markAllNotificationsRead = async (): Promise<void> => {
  await api.patch('/notifications/read-all');
};
