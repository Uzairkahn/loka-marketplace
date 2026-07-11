import { z } from 'zod';
import { CATEGORIES } from '@/lib/categories';

export const listingSchema = z.object({
  type: z.enum(['product', 'service'], { required_error: 'Choose a listing type' }),
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(120),
  description: z.string().trim().min(20, 'Description must be at least 20 characters').max(3000),
  category: z.enum(CATEGORIES, { required_error: 'Select a category' }),
  price: z.coerce.number().min(0, 'Price cannot be negative'),
  city: z.string().trim().optional(),
  country: z.string().trim().optional(),
  deliveryTime: z.string().trim().max(60).optional(),
});

export type ListingFormValues = z.infer<typeof listingSchema>;
