'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import StarRating from './StarRating';
import Textarea from '@/components/ui/Textarea';
import Button from '@/components/ui/Button';
import { createReview } from '@/lib/reviews';
import { getApiErrorMessage } from '@/lib/api';

interface ReviewFormValues {
  rating: number;
  comment: string;
}

export default function ReviewForm({
  bookingId,
  onSubmitted,
}: {
  bookingId: string;
  onSubmitted: () => void;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({ defaultValues: { rating: 0, comment: '' } });

  const onSubmit = async (values: ReviewFormValues) => {
    setFormError(null);
    if (values.rating < 1) {
      setFormError('Please select a star rating');
      return;
    }
    try {
      await createReview({ bookingId, rating: values.rating, comment: values.comment });
      onSubmitted();
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-card border border-white/10 bg-surface p-5">
      <p className="font-display text-lg text-ink-primary">Leave a review</p>

      <Controller
        name="rating"
        control={control}
        render={({ field }) => <StarRating value={field.value} onChange={field.onChange} />}
      />

      <Textarea
        label="Comment (optional)"
        placeholder="How was your experience?"
        error={errors.comment?.message}
        {...register('comment')}
      />

      {formError && (
        <p role="alert" className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
          {formError}
        </p>
      )}

      <Button type="submit" isLoading={isSubmitting} className="self-start">
        Submit review
      </Button>
    </form>
  );
}
