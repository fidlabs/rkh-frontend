import { cn } from '@/lib/utils';
import { FieldError } from 'react-hook-form';

export const ErrorMessage = ({ error, className }: { error: FieldError; className?: string }) => {
  return (
    <p
      role="alert"
      aria-live="assertive"
      className={cn('text-sm text-muted-foreground text-red-600 pt-1', className)}
      data-testid="error-message"
    >
      {error.message}
    </p>
  );
};
