'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { bookingRequestSchema, type BookingRequestValues } from '@/lib/validators/bookingSchema';
import { createBooking } from '@/lib/bookings';
import { getApiErrorMessage } from '@/lib/api';

interface BookingRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  listingTitle: string;
}

export default function BookingRequestModal({
  isOpen,
  onClose,
  listingId,
  listingTitle,
}: BookingRequestModalProps) {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BookingRequestValues>({ resolver: zodResolver(bookingRequestSchema) });

  const onSubmit = async (values: BookingRequestValues) => {
    setFormError(null);
    try {
      const booking = await createBooking({
        listingId,
        scheduledDate: new Date(values.scheduledDate).toISOString(),
        notes: values.notes,
      });
      reset();
      onClose();
      router.push(`/bookings/${booking._id}`);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  // Minimum selectable datetime is "now", formatted for the input.
  const minDateTime = new Date(Date.now() + 60 * 1000).toISOString().slice(0, 16);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Book "${listingTitle}"`}>
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-4">
        <Input
          label="Preferred date & time"
          type="datetime-local"
          min={minDateTime}
          error={errors.scheduledDate?.message}
          {...register('scheduledDate')}
        />
        <Textarea
          label="Notes for the seller (optional)"
          placeholder="Any details they should know before accepting…"
          error={errors.notes?.message}
          {...register('notes')}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Send booking request
        </Button>
      </form>
    </Modal>
  );
}
