import { SelectHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, id, className, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={selectId} className="text-sm font-medium text-ink-muted">
          {label}
        </label>
        <select
          id={selectId}
          ref={ref}
          aria-invalid={!!error}
          className={clsx(
            'rounded-lg border bg-surface px-4 py-2.5 text-ink-primary',
            'transition-colors duration-150 focus:outline-none',
            error ? 'border-danger focus:border-danger' : 'border-white/10 focus:border-amber',
            className
          )}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
