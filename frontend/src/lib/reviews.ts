import { api } from './api';
import type { PaginationMeta, Review } from '@/types';

interface ReviewsResponse {
  success: true;
  reviews: Review[];
  pagination: PaginationMeta;
}

export const fetchReviewsForListing = async (listingId: string): Promise<ReviewsResponse> => {
  const { data } = await api.get<ReviewsResponse>(`/reviews/listing/${listingId}`);
  return data;
};

export const fetchReviewsForUser = async (userId: string): Promise<ReviewsResponse> => {
  const { data } = await api.get<ReviewsResponse>(`/reviews/user/${userId}`);
  return data;
};

export const createReview = async (input: {
  bookingId: string;
  rating: number;
  comment?: string;
}): Promise<Review> => {
  const { data } = await api.post<{ success: true; review: Review }>('/reviews', input);
  return data.review;
};

export const flagReview = async (id: string): Promise<void> => {
  await api.post(`/reviews/${id}/flag`);
};
