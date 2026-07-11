import { z } from 'zod';

export const bookingRequestSchema = z.object({
  scheduledDate: z
    .string()
    .min(1, 'Pick a date and time')
    .refine((val) => new Date(val).getTime() > Date.now(), {
      message: 'Scheduled date must be in the future',
    }),
  notes: z.string().trim().max(1000, 'Notes cannot exceed 1000 characters').optional(),
});

export type BookingRequestValues = z.infer<typeof bookingRequestSchema>;
