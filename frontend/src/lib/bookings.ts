import { api } from './api';
import type { Booking, BookingStatus, PaginationMeta } from '@/types';

interface BookingsResponse {
  success: true;
  bookings: Booking[];
  pagination: PaginationMeta;
}

export const createBooking = async (input: {
  listingId: string;
  scheduledDate: string;
  notes?: string;
}): Promise<Booking> => {
  const { data } = await api.post<{ success: true; booking: Booking }>('/bookings', input);
  return data.booking;
};

export const fetchMyBookings = async (params: {
  role?: 'buyer' | 'seller';
  status?: BookingStatus;
  page?: number;
}): Promise<BookingsResponse> => {
  const { data } = await api.get<BookingsResponse>('/bookings/mine', { params });
  return data;
};

export const fetchBookingById = async (id: string): Promise<Booking> => {
  const { data } = await api.get<{ success: true; booking: Booking }>(`/bookings/${id}`);
  return data.booking;
};

export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<Booking> => {
  const { data } = await api.patch<{ success: true; booking: Booking }>(`/bookings/${id}/status`, {
    status,
  });
  return data.booking;
};
