import { TextareaHTMLAttributes, forwardRef } from 'react';
import clsx from 'clsx';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, id, className, ...props }, ref) => {
    const areaId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        <label htmlFor={areaId} className="text-sm font-medium text-ink-muted">
          {label}
        </label>
        <textarea
          id={areaId}
          ref={ref}
          aria-invalid={!!error}
          rows={5}
          className={clsx(
            'resize-y rounded-lg border bg-surface px-4 py-2.5 text-ink-primary placeholder:text-ink-faint',
            'transition-colors duration-150 focus:outline-none',
            error ? 'border-danger focus:border-danger' : 'border-white/10 focus:border-amber',
            className
          )}
          {...props}
        />
        {error && (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
export default Textarea;
