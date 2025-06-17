import { FieldError } from 'react-hook-form';
import * as React from 'react';
import { ReactElement } from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

type FormItemChildrenProps = {
  id?: string;
  error?: FieldError;
};

interface FormItemProps extends React.HTMLProps<HTMLDivElement> {
  label?: string;
  name?: string;
  error?: FieldError;
  required?: boolean;
  children: ReactElement<FormItemChildrenProps, string>;
  className?: string;
}

const FormItem = ({
  label,
  name,
  error,
  required,
  children,
  className,
  ...props
}: FormItemProps) => {
  return (
    <div className={cn('mb-2', className)} {...props}>
      {label ? (
        <Label htmlFor={name} required={required} error={!!error}>
          {label}
        </Label>
      ) : null}

      {React.cloneElement(children as React.ReactElement, {
        id: name,
        error,
      })}

      {error ? (
        <p
          role="alert"
          aria-live="assertive"
          className="text-sm text-muted-foreground text-red-600 pt-1"
        >
          {error.message}
        </p>
      ) : null}
    </div>
  );
};

export { FormItem };
