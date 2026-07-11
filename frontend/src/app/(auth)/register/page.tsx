'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap, { prefersReducedMotion } from '@/lib/gsap';
import { registerSchema, type RegisterFormValues } from '@/lib/validators/authSchemas';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({ resolver: zodResolver(registerSchema) });

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from(cardRef.current, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);

  const onSubmit = async (values: RegisterFormValues) => {
    setFormError(null);
    try {
      await registerUser(values.fullName, values.email, values.password);
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to create account');
    }
  };

  return (
    <div ref={cardRef} className="rounded-card border border-white/15 bg-surface-raised p-8 shadow-2xl shadow-black/40">
      <h1 className="font-display text-2xl font-semibold text-ink-primary">Join Loka</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Create an account to list services, buy locally, and start booking.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
        <Input
          label="Full name"
          type="text"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        {formError && (
          <p role="alert" className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-amber hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
