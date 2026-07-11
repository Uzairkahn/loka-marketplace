'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { listingSchema, type ListingFormValues } from '@/lib/validators/listingSchema';
import { CATEGORIES } from '@/lib/categories';
import { createListing } from '@/lib/listings';
import { getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function NewListingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [images, setImages] = useState<File[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({
    resolver: zodResolver(listingSchema),
    defaultValues: { type: 'product' },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (!authLoading && !user) router.replace('/login');
  }, [authLoading, user, router]);

  const onSubmit = async (values: ListingFormValues) => {
    setFormError(null);
    setImageError(null);
    if (images.length === 0) {
      setImageError('At least one image is required');
      return;
    }
    try {
      const listing = await createListing({ ...values, images });
      router.push(`/listings/${listing._id}`);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  if (authLoading || !user) return null;

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink-primary">Create a listing</h1>
        <p className="mt-1 text-ink-muted">List a product or offer a service to your community.</p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
          <div className="flex gap-3">
            {(['product', 'service'] as const).map((t) => (
              <label
                key={t}
                className={`flex-1 cursor-pointer rounded-card border p-4 text-center capitalize transition-colors ${
                  selectedType === t
                    ? 'border-amber bg-amber/10 text-amber'
                    : 'border-white/10 bg-surface text-ink-muted'
                }`}
              >
                <input type="radio" value={t} {...register('type')} className="sr-only" />
                {t}
              </label>
            ))}
          </div>

          <Input label="Title" error={errors.title?.message} {...register('title')} />

          <Select label="Category" error={errors.category?.message} {...register('category')}>
            <option value="">Select a category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Textarea
            label="Description"
            error={errors.description?.message}
            placeholder="Describe what you're offering in detail…"
            {...register('description')}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (Rs)"
              type="number"
              min={0}
              step="0.01"
              error={errors.price?.message}
              {...register('price')}
            />
            {selectedType === 'service' && (
              <Input
                label="Delivery time (e.g. 3-5 days)"
                error={errors.deliveryTime?.message}
                {...register('deliveryTime')}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register('city')} />
            <Input label="Country" {...register('country')} />
          </div>

          <ImageUploader files={images} onChange={setImages} error={imageError ?? undefined} />

          {formError && (
            <p role="alert" className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Publish listing
          </Button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
