import {
  useController,
  type Control,
  type FieldError,
  type FieldValues,
  type Path,
  type PathValue,
  type RegisterOptions,
} from 'react-hook-form';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { ErrorMessage } from './error-message';

type FormItemChildrenProps = {
  id?: string;
  name?: string;
  required?: boolean;
  error?: FieldError;
};

interface ControlledFormItemProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<'div'>, 'children' | 'defaultValue'> {
  control: Control<TFieldValues>;
  label?: string;
  name: Path<TFieldValues>;
  required?: boolean;
  children: React.ReactElement<any> | ((props: FormItemChildrenProps) => React.ReactElement<any>);
  className?: string;
  rules?: RegisterOptions<TFieldValues, Path<TFieldValues>>;
  shouldUnregister?: boolean;
  defaultValue?: PathValue<TFieldValues, Path<TFieldValues>>;
  disabled?: boolean;
}

interface UncontrolledFormItemProps<TFieldValues extends FieldValues>
  extends Omit<React.ComponentProps<'div'>, 'children'> {
  label?: string;
  name?: Path<TFieldValues>;
  required?: boolean;
  children: React.ReactElement<any> | ((props: FormItemChildrenProps) => React.ReactElement<any>);
  className?: string;
  error?: FieldError;
  disabled?: boolean;
}

export const ControlledFormItem = <TFieldValues extends FieldValues>({
  control,
  label,
  name,
  children,
  className,
  rules,
  shouldUnregister,
  defaultValue,
  disabled,
  ...props
}: ControlledFormItemProps<TFieldValues>) => {
  const {
    field,
    fieldState: { error },
  } = useController({
    control,
    name,
    rules,
    shouldUnregister,
    defaultValue,
    disabled,
  });

  return (
    <div className={cn('mb-2', className)} {...props}>
      {label ? (
        <Label
          htmlFor={name}
          required={Boolean(rules?.required)}
          error={!!error}
          disabled={field.disabled}
        >
          {label}
        </Label>
      ) : null}

      {React.cloneElement(children as React.ReactElement, {
        ...((children as React.ReactElement).props || {}),
        ...field,
        id: name,
        error: Boolean(error),
      })}

      {error ? <ErrorMessage error={error} /> : null}
    </div>
  );
};

export const FormItem = <TFieldValues extends FieldValues>({
  label,
  name,
  required,
  children,
  className,
  error,
  disabled,
  ...props
}: UncontrolledFormItemProps<TFieldValues>) => {
  return (
    <div className={cn('mb-2', className)} {...props}>
      {label ? (
        <Label
          htmlFor={name}
          required={Boolean(required)}
          error={!!error}
          disabled={disabled}
          className="mb-2"
        >
          {label}
        </Label>
      ) : null}

      {React.cloneElement(children as React.ReactElement, {
        ...((children as React.ReactElement).props || {}),
        id: name,
        required: Boolean(required),
        disabled,
        error: Boolean(error),
      })}

      {error ? <ErrorMessage error={error} /> : null}
    </div>
  );
};
