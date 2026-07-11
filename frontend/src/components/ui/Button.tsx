import { ButtonHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={clsx(
          'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold',
          'transition-transform duration-200 ease-out active:scale-[0.97]',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variant === 'primary' && 'bg-amber text-deep hover:bg-amber-soft shadow-glow',
          variant === 'secondary' &&
            'bg-surface-raised text-ink-primary border border-white/10 hover:border-white/25',
          variant === 'ghost' && 'text-ink-muted hover:text-ink-primary',
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export default Button;
