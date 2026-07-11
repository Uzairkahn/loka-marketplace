import { api } from './api';
import type { Listing, ListingFilters, PaginationMeta } from '@/types';

interface ListingsResponse {
  success: true;
  listings: Listing[];
  pagination: PaginationMeta;
}

export const fetchListings = async (filters: ListingFilters): Promise<ListingsResponse> => {
  const { data } = await api.get<ListingsResponse>('/listings', { params: filters });
  return data;
};

export const fetchCategoryCounts = async (): Promise<{ name: string; count: number }[]> => {
  const { data } = await api.get<{ success: true; categories: { name: string; count: number }[] }>(
    '/listings/meta/category-counts'
  );
  return data.categories;
};

export const fetchListingById = async (id: string): Promise<Listing> => {
  const { data } = await api.get<{ success: true; listing: Listing }>(`/listings/${id}`);
  return data.listing;
};

export const fetchMyListings = async (): Promise<ListingsResponse> => {
  const { data } = await api.get<ListingsResponse>('/listings/mine');
  return data;
};

export const fetchFavorites = async (): Promise<{ success: true; listings: Listing[] }> => {
  const { data } = await api.get('/listings/favorites');
  return data;
};

export interface ListingFormInput {
  type: 'product' | 'service';
  title: string;
  description: string;
  category: string;
  price: number;
  city?: string;
  country?: string;
  deliveryTime?: string;
  availability?: string[];
  images: File[];
}

const toFormData = (input: Partial<ListingFormInput>) => {
  const formData = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (key === 'images' && Array.isArray(value)) {
      value.forEach((file) => formData.append('images', file));
    } else if (key === 'availability' && Array.isArray(value)) {
      formData.append('availability', JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });
  return formData;
};

export const createListing = async (input: ListingFormInput): Promise<Listing> => {
  const { data } = await api.post<{ success: true; listing: Listing }>(
    '/listings',
    toFormData(input),
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.listing;
};

export const updateListing = async (
  id: string,
  input: Partial<ListingFormInput> & { removedImageIds?: string[] }
): Promise<Listing> => {
  const { removedImageIds, ...rest } = input;
  const formData = toFormData(rest);
  if (removedImageIds?.length) {
    formData.append('removedImageIds', removedImageIds.join(','));
  }
  const { data } = await api.put<{ success: true; listing: Listing }>(
    `/listings/${id}`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return data.listing;
};

export const deleteListing = async (id: string): Promise<void> => {
  await api.delete(`/listings/${id}`);
};

export const toggleFavorite = async (
  id: string
): Promise<{ isFavorited: boolean; favoritesCount: number }> => {
  const { data } = await api.post(`/listings/${id}/favorite`);
  return data;
};
