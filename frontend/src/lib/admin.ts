import { api } from './api';
import type { AdminReview, AdminUser, Listing, PaginationMeta, PlatformStats } from '@/types';

export const fetchPlatformStats = async (): Promise<PlatformStats> => {
  const { data } = await api.get<{ success: true; stats: PlatformStats }>('/admin/stats');
  return data.stats;
};

export const fetchAdminUsers = async (params: {
  search?: string;
  role?: string;
  status?: 'active' | 'suspended';
  page?: number;
}): Promise<{ users: AdminUser[]; pagination: PaginationMeta }> => {
  const { data } = await api.get<{ success: true; users: AdminUser[]; pagination: PaginationMeta }>(
    '/admin/users',
    { params }
  );
  return data;
};

export const setUserActiveStatus = async (userId: string, isActive: boolean): Promise<AdminUser> => {
  const { data } = await api.patch<{ success: true; user: AdminUser }>(
    `/admin/users/${userId}/status`,
    { isActive }
  );
  return data.user;
};

export const fetchAdminListings = async (params: {
  status?: string;
  page?: number;
}): Promise<{ listings: Listing[]; pagination: PaginationMeta }> => {
  const { data } = await api.get<{ success: true; listings: Listing[]; pagination: PaginationMeta }>(
    '/admin/listings',
    { params }
  );
  return data;
};

export const setListingStatus = async (
  listingId: string,
  status: 'active' | 'removed' | 'pending'
): Promise<Listing> => {
  const { data } = await api.patch<{ success: true; listing: Listing }>(
    `/admin/listings/${listingId}/status`,
    { status }
  );
  return data.listing;
};

export const fetchReportedReviews = async (): Promise<{
  reviews: AdminReview[];
  pagination: PaginationMeta;
}> => {
  const { data } = await api.get<{
    success: true;
    reviews: AdminReview[];
    pagination: PaginationMeta;
  }>('/admin/reports');
  return data;
};

export const resolveReport = async (
  reviewId: string,
  action: 'dismiss' | 'delete'
): Promise<void> => {
  await api.patch(`/admin/reports/${reviewId}`, { action });
};
