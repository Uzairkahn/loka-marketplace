'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import gsap, { prefersReducedMotion } from '@/lib/gsap';
import { loginSchema, type LoginFormValues } from '@/lib/validators/authSchemas';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formError, setFormError] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  useEffect(() => {
    if (!cardRef.current) return;
    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) return;
      gsap.from(cardRef.current, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out' });
    });
    return () => ctx.revert();
  }, []);

  const onSubmit = async (values: LoginFormValues) => {
    setFormError(null);
    try {
      await login(values.email, values.password);
      router.refresh();
      router.push('/dashboard');
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Unable to log in');
    }
  };

  return (
    <div
      ref={cardRef}
      className="rounded-card border border-white/15 bg-surface-raised p-8 shadow-2xl shadow-black/40"
    >
      <h1 className="font-display text-2xl font-semibold text-ink-primary">Welcome back</h1>
      <p className="mt-1 text-sm text-ink-muted">Log in to manage your listings and bookings.</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="mt-6 flex flex-col gap-4">
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="-mt-1 text-right">
          <Link href="/forgot-password" className="text-sm text-teal-soft hover:underline">
            Forgot password?
          </Link>
        </div>

        {formError && (
          <p role="alert" className="rounded-lg bg-danger/10 px-4 py-2.5 text-sm text-danger">
            {formError}
          </p>
        )}

        <Button type="submit" isLoading={isSubmitting} className="mt-2 w-full">
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        New to Loka?{' '}
        <Link href="/register" className="font-medium text-amber hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
