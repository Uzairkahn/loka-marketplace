export type UserRole = 'user' | 'admin';

export interface User {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  bio: string;
  phone: string;
  location: {
    city: string;
    country: string;
  };
  skills: string[];
  favorites: string[];
  ratingAverage: number;
  ratingCount: number;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
}

export interface ApiErrorShape {
  success: false;
  message: string;
  details?: { field: string; message: string }[] | string[] | null;
}

export type ListingType = 'product' | 'service';
export type ListingStatus = 'pending' | 'active' | 'removed';

export interface ListingImage {
  url: string;
  publicId: string;
}

export interface ListingOwner {
  _id: string;
  fullName: string;
  avatarUrl: string;
  bio?: string;
  ratingAverage: number;
  ratingCount?: number;
  location?: { city: string; country: string };
}

export interface Listing {
  _id: string;
  owner: ListingOwner;
  type: ListingType;
  title: string;
  description: string;
  category: string;
  price: number;
  images: ListingImage[];
  location: { city: string; country: string };
  deliveryTime?: string;
  availability?: string[];
  status: ListingStatus;
  favoritesCount: number;
  ratingAverage: number;
  ratingCount: number;
  createdAt: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
}

export interface ListingFilters {
  keyword?: string;
  category?: string;
  type?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  city?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'rating';
  page?: number;
}

export type BookingStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export interface BookingParty {
  _id: string;
  fullName: string;
  avatarUrl: string;
}

export interface BookingListingRef {
  _id: string;
  title: string;
  images: ListingImage[];
  price: number;
  type: ListingType;
}

export interface Booking {
  _id: string;
  listing: BookingListingRef;
  buyer: BookingParty;
  seller: BookingParty;
  scheduledDate: string;
  notes: string;
  status: BookingStatus;
  priceAtBooking: number;
  createdAt: string;
}

export interface Review {
  _id: string;
  booking: string;
  listing: string | { _id: string; title: string };
  reviewer: BookingParty;
  targetUser: string;
  rating: number;
  comment: string;
  isFlagged: boolean;
  createdAt: string;
}

export interface AppNotification {
  _id: string;
  type:
    | 'booking_request'
    | 'booking_status_update'
    | 'new_message'
    | 'new_review'
    | 'listing_approved'
    | 'listing_removed';
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  sender: string;
  recipient: string;
  text: string;
  imageUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface ConversationSummary {
  conversationId: string;
  otherUser: { _id: string; fullName: string; avatarUrl: string };
  lastMessage: ChatMessage;
  unreadCount: number;
}

export interface DashboardSummary {
  activeListingsCount: number;
  pendingBookingsAsSeller: number;
  upcomingBookingsAsBuyer: number;
  unreadNotificationsCount: number;
  favoritesCount: number;
  earnings: number;
  completedSalesCount: number;
  recentBookings: Booking[];
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  totalListings: number;
  pendingListings: number;
  activeListings: number;
  totalBookings: number;
  completedBookings: number;
  flaggedReviewsCount: number;
  platformGMV: number;
}

export interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface AdminReview {
  _id: string;
  reviewer: { _id: string; fullName: string; email: string };
  targetUser: { _id: string; fullName: string; email: string };
  listing: { _id: string; title: string };
  rating: number;
  comment: string;
  createdAt: string;
}
