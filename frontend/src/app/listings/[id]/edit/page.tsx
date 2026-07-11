'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import ImageUploader from '@/components/ui/ImageUploader';
import { listingSchema, type ListingFormValues } from '@/lib/validators/listingSchema';
import { CATEGORIES } from '@/lib/categories';
import { fetchListingById, updateListing } from '@/lib/listings';
import { getApiErrorMessage } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [newImages, setNewImages] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: listing, isLoading: listingLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingById(id),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ListingFormValues>({ resolver: zodResolver(listingSchema) });

  useEffect(() => {
    if (listing) {
      reset({
        type: listing.type,
        title: listing.title,
        description: listing.description,
        category: listing.category as ListingFormValues['category'],
        price: listing.price,
        city: listing.location.city,
        country: listing.location.country,
        deliveryTime: listing.deliveryTime,
      });
    }
  }, [listing, reset]);

  useEffect(() => {
    if (!authLoading && !listingLoading && listing && user && user._id !== listing.owner._id) {
      router.replace(`/listings/${id}`);
    }
  }, [authLoading, listingLoading, listing, user, id, router]);

  const remainingExistingImages = (listing?.images || []).filter(
    (img) => !removedImageIds.includes(img.publicId)
  );

  const onSubmit = async (values: ListingFormValues) => {
    setFormError(null);
    if (remainingExistingImages.length + newImages.length === 0) {
      setFormError('A listing must have at least one image');
      return;
    }
    try {
      await updateListing(id, { ...values, images: newImages, removedImageIds });
      router.push(`/listings/${id}`);
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    }
  };

  if (authLoading || listingLoading || !listing) {
    return (
      <main>
        <Navbar />
        <div className="mx-auto max-w-2xl px-6 py-20 text-center text-ink-muted">Loading…</div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-3xl font-semibold text-ink-primary">Edit listing</h1>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-8 flex flex-col gap-5">
          <Input label="Title" error={errors.title?.message} {...register('title')} />

          <Select label="Category" error={errors.category?.message} {...register('category')}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Textarea label="Description" error={errors.description?.message} {...register('description')} />

          <div className="grid grid-cols-2 gap-4">
            <Input label="Price (Rs)" type="number" min={0} step="0.01" error={errors.price?.message} {...register('price')} />
            {listing.type === 'service' && (
              <Input label="Delivery time" error={errors.deliveryTime?.message} {...register('deliveryTime')} />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="City" {...register('city')} />
            <Input label="Country" {...register('country')} />
          </div>

          <ImageUploader
            files={newImages}
            onChange={setNewImages}
            existingImageUrls={remainingExistingImages.map((img) => img.url)}
          />
          {listing.images.length > 0 && (
            <div className="-mt-3 flex flex-wrap gap-2">
              {listing.images
                .filter((img) => !removedImageIds.includes(img.publicId))
                .map((img) => (
                  <button
                    key={img.publicId}
                    type="button"
                    onClick={() => setRemovedImageIds((prev) => [...prev, img.publicId])}
                    className="text-xs text-danger hover:underline"
                  >
                    Remove existing image
                  </button>
                ))}
            </div>
          )}

          {formError && (
            <p role="alert" className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
              {formError}
            </p>
          )}

          <Button type="submit" isLoading={isSubmitting} className="mt-2">
            Save changes
          </Button>
        </form>
      </div>
      <Footer />
    </main>
  );
}
